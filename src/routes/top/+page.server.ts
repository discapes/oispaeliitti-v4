import type { Actions, PageServerLoad } from './$types';
import { createClient } from '@redis/client';
import { decrypt, encrypt } from '$lib/crypto';
import { sendMail } from '$lib/mail';
import { ADMIN_EMAIL, REDIS_URL } from '$env/static/private';
import { URLS } from '$lib/urls';
import { getLeaderboard, getScore, getScoreAndNick, setNick, setScore } from '$lib/model';
import { error } from '@sveltejs/kit';

type ActionResult = Promise<{
	type: 'validation_error' | 'check_email' | 'rename_success';
	message: string;
}>;

export const actions: Actions = {
	login: async ({ request, url }): ActionResult => {
		const data = await request.formData();
		const email = data.get('email');
		if (typeof email != 'string' || email.includes(',') || !email.endsWith('edu.turku.fi')) {
			return {
				type: 'validation_error',
				message: 'Syötä edu.turku.fi-sähköposti.'
			};
		}
		const linja = data.get('linja');
		if (typeof linja != 'string' || !['melu', 'yle', 'lulu'].includes(linja))
			return {
				type: 'validation_error',
				message: 'Valitse luonnontiede-, yleis- tai merilinja.'
			};

		const iown = encrypt('iown2-' + email + '-' + linja);

		await sendMail({
			from: `"oispaeliitti.fi" <no-reply@oispaeliitti.fi>`,
			to: email,
			subject: `Kirjaudu oispaeliittiin`,
			text: `${new URL(URLS.LOGIN, url)}?token=${iown}`
		});

		return {
			type: 'check_email',
			message: 'Katso sähköpostisi (myös roskaposti). Voit sulkea tämän välilehden.'
		};
	},
	async rename({ request, cookies }): ActionResult {
		if (!cookies.get('token')) throw error(400);

		const token = decrypt(cookies.get('token')!);
		if (!token.startsWith('iown2-')) throw error(400, 'Invalid token');
		const [, email] = token.split('-');
		const nick = (await request.formData()).get('nick');

		if (typeof nick === 'string' && nick.length >= 3 && nick.length <= 20) {
			setNick(email, nick);
			return {
				type: 'rename_success',
				message: 'Nimi vaihdettu.'
			};
		}
		return {
			type: 'validation_error',
			message: 'Nimen pitää olla 3-20 kirjainta.'
		};
	}
};

type LoadResult =
	| {
			loggedIn: false;
	  }
	| {
			loggedIn: true;
			top: { score: number; nick: string }[];
			email: string;
			myscore?: string;
			total: { pl: number; pm: number; py: number };
			linja: string;
			mynick?: string;
			admin_url?: string;
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

	const Pmy = getScoreAndNick(email);
	const Ptop = getLeaderboard();
	const Plinjat = client.hGetAll('points');

	const [my, top, { yle, lulu, melu }] = await Promise.all([Pmy, Ptop, Plinjat]);

	/*await*/ client.disconnect();

	return {
		loggedIn: true,
		top,
		email,
		total: {
			pl: +lulu || 0, // * 10,
			py: +yle || 0, // * 6,
			pm: +melu || 0 // * 25
		},
		linja,
		myscore: my?.score?.toString(),
		mynick: my?.nick,
		admin_url: email === ADMIN_EMAIL ? URLS.ADMIN : undefined
	};
};
