import { redis } from '$lib/model';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, request, getClientAddress }) => {
	const [close, db] = await redis();
	const res = await db.sAdd('rkv', getClientAddress() + ' - ' + (await request.text()));
	close();
	return new Response();
};
