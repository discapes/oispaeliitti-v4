import { redis } from '$lib/model';
import type { RequestHandler } from './$types';

const TIMEZONE_OFFSET = 2;

function timestamp(date: Date) {
	return (
		[
			date.getFullYear(),
			date.getUTCMonth().toString().padStart(2, '0') + 1,
			date.getUTCDate().toString().padStart(2, '0')
		].join('-') +
		' ' +
		[
			(date.getUTCHours() + TIMEZONE_OFFSET).toString().padStart(2, '0'),
			date.getUTCMinutes().toString().padStart(2, '0')
		].join(':')
	);
}

export const POST: RequestHandler = async ({ url, request, getClientAddress }) => {
	const addr = getClientAddress();
	if (!addr.startsWith('127')) {
		const [close, db] = await redis();
		const res = await db.zAdd('rkv-data', {
			score: Date.now(),
			value: timestamp(new Date()) + ' - ' + addr + ' - ' + (await request.text())
		});
		close();
	}
	return new Response();
};
