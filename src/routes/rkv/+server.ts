import { redis } from '$lib/model';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, request, getClientAddress }) => {
	const addr = getClientAddress();
	if (!addr.startsWith('127')) {
		const [close, db] = await redis();
		const res = await db.sAdd('rkv', addr + ' - ' + (await request.text()));
		close();
	}
	return new Response();
};
