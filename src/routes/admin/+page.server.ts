import type { PageServerLoad } from './$types';
import { MongoClient } from 'mongodb';
import { decrypt } from '$lib/crypto';
import { error } from '@sveltejs/kit';
import { ADMIN_EMAIL, MONGODB_URL } from '$env/static/private';

const client = () => new MongoClient(MONGODB_URL).db('oispaeliitti').collection('players');

export const load: PageServerLoad = async ({ cookies }) => {
	if (!cookies.get('token')) throw error(400);
	const token = decrypt(cookies.get('token')!);
	if (!token.startsWith('iown2-') || token.split('-')[1] != ADMIN_EMAIL)
		throw error(400, 'Invalid token');

	return {
		leaderboard: getFullLeaderboard()
	};
};

async function getFullLeaderboard(): Promise<{ nick: string; score: number }[]> {
	const res = await client()
		.find({}, { sort: { score: -1 } })
		.map((o) => ({ ...o, _id: o._id.toString().slice(0, 10) }))
		.toArray();
	return <{ nick: string; score: number }[]>(<unknown>res);
}
