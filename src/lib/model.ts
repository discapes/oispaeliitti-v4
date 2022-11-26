import { MONGODB_URL } from '$env/static/private';
import { MongoClient } from 'mongodb';

const client = () => new MongoClient(MONGODB_URL).db('oispaeliitti').collection('players');

export async function setScore(email: string, score: number) {
	await client().updateOne({ email }, { $max: { score } }, { upsert: true });
}

export async function setNick(email: string, nick: string) {
	await client().updateOne({ email }, { $set: { nick } }, { upsert: true });
}

export async function getScore(email: string): Promise<number | undefined> {
	const res = await client().findOne({ email }, { projection: { score: 1 } });
	return res?.score;
}

export async function getScoreAndNick(
	email: string
): Promise<{ score: number; nick?: string } | null> {
	const res = await client().findOne({ email }, { projection: { score: 1, nick: 1 } });
	return <{ score: number; nick?: string } | null>res;
}

export async function getLeaderboard(): Promise<{ nick: string; score: number }[]> {
	const res = await client()
		.find(
			{ nick: { $exists: 1 } },
			{ sort: { score: -1 }, limit: 10, projection: { nick: 1, score: 1, _id: 0 } }
		)
		.toArray();
	return <{ nick: string; score: number }[]>(<unknown>res);
}
