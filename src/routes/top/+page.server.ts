import { ADMIN_EMAIL, FEEDBACK_EMAIL } from '$env/static/private';
import { decrypt, encrypt } from '$lib/crypto';
import { sendMail } from '$lib/mail';
import {
	getLeaderboard,
	getLinjaScores,
	getScoreMsgAndNick,
	mongo,
	redis,
	setNick
} from '$lib/model';
import { URLS } from '$lib/urls';
import { error, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type ActionResult = Promise<
	| {
			type: 'validation_error' | 'check_email';
			message: string;
	  }
	| {
			type: 'rename_success';
	  }
>;

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
		const { email } = auth(cookies);
		const nick = (await request.formData()).get('nick');

		if (typeof nick !== 'string' || nick.length < 3 || nick.length > 20) {
			return {
				type: 'validation_error',
				message: 'Nimen pitää olla 3-20 kirjainta.'
			};
		}
		const [close, client] = await redis();
		const [blockedNick, blockedEmail] = await Promise.all([
			client.sIsMember('blockedNicks', nick),
			client.sIsMember('blockedEmails', email)
		]);
		close();

		if (blockedNick) {
			return {
				type: 'validation_error',
				message: 'Kielletty nimi.'
			};
		} else if (blockedEmail) {
			return {
				type: 'validation_error',
				message: 'Sinut on estetty.'
			};
		} else {
			setNick(email, nick);
			return { type: 'rename_success' };
		}
	},
	async readmsg({ cookies }) {
		const { email } = auth(cookies);
		const [close, db] = mongo();
		const res = await db.updateOne({ email }, { $unset: { msg: '' } });
		close();
	},
	async feedback({ request, cookies }) {
		const { email, linja } = auth(cookies);
		const feedback = (await request.formData()).get('text');

		await sendMail({
			from: `"oispaeliitti.fi" <no-reply@oispaeliitti.fi>`,
			to: FEEDBACK_EMAIL,
			subject: `Palaute oispaeliitistä`,
			text: `Palaute saatu käyttäjältä ${email} (${linja}): \n\n${feedback}`
		});
	}
};

function auth(cookies: Cookies) {
	if (!cookies.get('token')) throw error(400);
	const token = decrypt(cookies.get('token')!);
	if (!token.startsWith('iown2-')) throw error(400, 'Invalid token');
	const [, email, linja] = token.split('-');
	return { email, linja };
}

type LoadResult =
	| {
			loggedIn: false;
	  }
	| {
			loggedIn: true;
			top: { score?: number; nick: string; color?: string }[];
			email: string;
			myscore?: string;
			total: { pl: number; pm: number; py: number };
			linja: string;
			mynick?: string;
			mymsg?: string;
			admin_url?: string;
			times: {
				my: number;
				leaderboard: number;
				linjat: number;
			};
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

	const times = {
		my: 0,
		leaderboard: 0,
		linjat: 0
	};
	const Pmy = time(getScoreMsgAndNick(email), (t) => (times.my = t));
	const Ptop = time(getLeaderboard(), (t) => (times.leaderboard = t));
	const Plinjat = time(getLinjaScores(), (t) => (times.linjat = t));
	const [my, top, { yle, lulu, melu }] = await Promise.all([Pmy, Ptop, Plinjat]);

	return {
		loggedIn: true,
		top,
		email,
		times,
		total: {
			pl: lulu, // * 10,
			py: yle, // * 6,
			pm: melu // * 25
		},
		linja,
		myscore: my?.score?.toString(),
		mymsg: my?.msg,
		mynick: my?.nick,
		admin_url: email === ADMIN_EMAIL ? URLS.ADMIN : undefined
	};
};

async function time<T>(p: Promise<T>, log: (diff: number) => void) {
	const before = Date.now();
	const res = await p;
	const after = Date.now();
	const diff = after - before;
	log(diff);
	return res;
}
