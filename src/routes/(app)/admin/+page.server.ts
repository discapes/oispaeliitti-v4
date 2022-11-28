import { ADMIN_EMAIL } from '$env/static/private';
import { decrypt } from '$lib/crypto';
import { getLinjaScores, mongo, redis, setNick, unsetNick } from '$lib/model';
import { error, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type ActionResult = Promise<
	| {
			type: 'validation_error';
			message: string;
	  }
	| {
			type: string;
	  }
>;

export const actions: Actions = {
	async edit({ request, cookies }): ActionResult {
		authAdmin(cookies);

		const data = await request.formData();
		const email = data.get('email');
		const field = <any>data.get('field');
		const value = data.get('new_value');

		if (
			typeof email === 'string' &&
			typeof value === 'string' &&
			email.endsWith('edu.turku.fi') &&
			['nick', 'color', 'score', 'msg'].includes(field)
		) {
			if (field === 'score' && isNaN(+value))
				return {
					type: 'validation_error',
					message: 'Invalid number'
				};

			const [close, db] = mongo();
			const res = await db.updateOne(
				{ email },
				value === ''
					? {
							$unset: { [field]: '' }
					  }
					: { $set: { [field]: field === 'score' ? +value : value } }
			);
			close();

			return {
				type: 'edit_success'
			};
		} else {
			return {
				type: 'validation_error',
				message: 'Invalid email'
			};
		}
	},
	async block({ request, cookies }): ActionResult {
		authAdmin(cookies);

		const data = await request.formData();
		const [type, value] = data.entries().next().value;

		if (typeof value === 'string' && value.length > 0) {
			const [close, client] = await redis();

			switch (type) {
				case 'email':
					await client.sAdd('blockedEmails', value);
					break;
				case 'nick':
					await client.sAdd('blockedNicks', value);
					break;
				case 'un_email':
					await client.sRem('blockedEmails', value);
					break;
				case 'un_nick':
					await client.sRem('blockedNicks', value);
					break;
				default:
					throw error(400, 'invalid operation');
			}

			close();
			return {
				type: `block_${type}_success`
			};
		} else {
			return {
				type: 'validation_error',
				message: 'Empty value'
			};
		}
	},
	async editlinjascore({ request, cookies }): ActionResult {
		authAdmin(cookies);

		const data = await request.formData();
		const [linja, score] = data.entries().next().value;

		console.log({ linja, score });

		if (isNaN(score)) {
			return {
				type: 'validation_error',
				message: 'Invalid number'
			};
		} else {
			const [close, client] = await redis();
			await client.hSet('points', linja, score);
			close();
			return {
				type: 'linja_edit_success'
			};
		}
	}
};

export const load: PageServerLoad = async ({ cookies }) => {
	authAdmin(cookies);

	const Pblocked = redis().then(async ([close, client]) => {
		const blockedEmails = await client.sMembers('blockedEmails');
		const blockedNicks = await client.sMembers('blockedNicks');
		close();
		return { blockedEmails, blockedNicks };
	});

	return {
		leaderboard: getFullLeaderboard(),
		blockedEmails: Pblocked.then((o) => o.blockedEmails),
		blockedNicks: Pblocked.then((o) => o.blockedNicks),
		linjat: getLinjaScores()
	};
};

function authAdmin(cookies: Cookies) {
	if (!cookies.get('token')) throw error(400);
	const token = decrypt(cookies.get('token')!);
	if (!token.startsWith('iown2-') || token.split('-')[1] != ADMIN_EMAIL)
		throw error(400, 'Invalid token');
}

async function getFullLeaderboard(): Promise<Record<string, any>[]> {
	const [close, db] = mongo();
	const res = await db
		.find({}, { sort: { score: -1 } })
		.map((o) => ({ ...o, _id: o._id.toString().slice(0, 10) }))
		.toArray();
	close();
	return res;
}
