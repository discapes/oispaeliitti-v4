import type { Actions, PageServerLoad } from './$types';
import { createClient } from '@redis/client';
import { decrypt, encrypt } from '$lib/crypto';
import { sendMail } from '$lib/mail';
import { REDIS_URL } from '$env/static/private';
import { URLS } from '$lib/urls';
import { error } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email');
		if (typeof email != 'string' || !email.endsWith('edu.turku.fi')) {
			return {
				success: false,
				message: 'Syötä edu.turku.fi-sähköposti.'
			};
		}
		const linja = data.get('linja');
		if (typeof linja != 'string' || !['melu', 'yle', 'lulu'].includes(linja))
			return {
				success: false,
				message: 'Valitse luonnontiede-, yleis- tai merilinja.'
			};

		const iown = encrypt('iown2-' + email + '-' + linja);

		await sendMail({
			from: `"oispaeliitti.fi" <no-reply@oispaeliitti.fi>`,
			to: email,
			subject: `Kirjaudu oispaeliittiin`,
			text: `${new URL(URLS.LOGIN, url)}?token=${iown}`
		});

		return { success: true };
	}
};

type LoadResult =
	| {
			loggedIn: false;
	  }
	| {
			loggedIn: true;
			top: { score: number; value: string }[];
			email: string;
			myscore: string;
			total: { pl: number; pm: number; py: number };
			linja: string;
	  };

export const load: PageServerLoad = async ({ cookies }): Promise<LoadResult> => {
	if (!cookies.get('token'))
		return {
			loggedIn: false
		};

	const token = decrypt(cookies.get('token')!);
	if (!token.startsWith('iown2-'))
		return {
			loggedIn: false
			//TODO msg
		};
	const [, email, linja] = token.split('-');

	const client = createClient({
		url: REDIS_URL
	});
	await client.connect();

	const myscore = await client.zScore('players', email);
	const top = await client.zRangeWithScores('players', 0, 9, { REV: true });
	const { lulu, yle, melu } = await client.hGetAll('points');

	await client.disconnect();

	return {
		loggedIn: true,
		top,
		email,
		myscore: myscore ? myscore.toString() : 'null',
		total: {
			pl: +lulu || 0, // * 10,
			py: +yle || 0, // * 6,
			pm: +melu || 0 // * 25
		},
		linja
	};
};
