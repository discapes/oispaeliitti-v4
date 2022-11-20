import { REDIS_URL } from '$env/static/private';
import { decrypt } from '$lib/crypto';
import { createClient } from '@redis/client';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	if (!cookies.get('token')) throw error(400);

	const token = decrypt(cookies.get('token')!);
	if (!token.startsWith('iown-')) throw new Error('Invalid token');
	const email = token.slice('iown-'.length);

	const score = +(await request.text());

	const client = createClient({
		url: REDIS_URL
	});
	await client.connect();
	await client.zAdd('players', { score, value: email }, { GT: true });
	await client.disconnect();
	return new Response(null);
};
