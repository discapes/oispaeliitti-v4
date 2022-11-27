import { decrypt } from '$lib/crypto';
import { redis, setScore } from '$lib/model';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	if (!cookies.get('token')) throw error(400);

	const token = decrypt(cookies.get('token')!);
	if (!token.startsWith('iown2-')) throw error(400, 'Invalid token');
	const [, email, linja] = token.split('-');

	const score = +(await request.text());

	await setScore(email, score);
	const [close, client] = await redis();
	await client.hIncrBy('points', linja, score);
	close();

	return new Response(null);
};
