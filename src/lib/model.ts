import { MONGODB_URL, REDIS_URL } from '$env/static/private';
import { createClient as createRedisClient } from '@redis/client';
import { MongoClient } from 'mongodb';

export const mongo = () => {
	const client = new MongoClient(MONGODB_URL);
	return [client.close.bind(client), client.db('oispaeliitti').collection('players')] as const;
};

export const redis = () => {
	const client = createRedisClient({
		url: REDIS_URL
	});
	return client.connect().then(() => [client.disconnect.bind(client), client] as const);
};

export async function setScore(email: string, score: number) {
	const [close, db] = mongo();
	await db.updateOne({ email }, { $max: { score } }, { upsert: true });
	close();
}

export async function setNick(email: string, nick: string) {
	const [close, db] = mongo();
	await db.updateOne({ email }, { $set: { nick } }, { upsert: true });
	close();
}

export async function unsetNick(email: string) {
	const [close, db] = mongo();
	await db.updateOne({ email }, { $unset: { nick: '' } }, { upsert: true });
	close();
}

export async function getScore(email: string): Promise<number | undefined> {
	const [close, db] = mongo();
	const res = await db.findOne({ email }, { projection: { score: 1 } });
	close();
	return res?.score;
}

export async function getLinjaScores() {
	const [close, db] = await redis();
	const res = await db.hGetAll('points');
	close();
	return {
		yle: +res.yle || 0,
		melu: +res.melu || 0,
		lulu: +res.lulu || 0
	};
}

export async function getScoreMsgAndNick(
	email: string
): Promise<{ score: number; msg: string; nick?: string } | null> {
	const [close, db] = mongo();
	const res = await db.findOne({ email }, { projection: { score: 1, nick: 1, msg: 1 } });
	close();
	return <any>res;
}

export async function getLeaderboard(): Promise<{ nick: string; score: number; color?: string }[]> {
	const [close, db] = mongo();
	const res = await db
		.find(
			{ nick: { $exists: 1 /*$ne: ''*/ }, score: { $exists: 1 } },
			{ sort: { score: -1 }, limit: 10, projection: { nick: 1, score: 1, color: 1, _id: 0 } }
		)
		.toArray();
	close();
	return <any>res;
}
