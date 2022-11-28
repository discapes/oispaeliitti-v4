import { redis } from '$lib/model';
import type { RequestHandler } from './$types';

function timestamp(date: Date) {
	return (
		[date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
		' ' +
		[date.getHours(), date.getMinutes()].join(':')
	);
}

export const POST: RequestHandler = async ({ url, request, getClientAddress }) => {
	const addr = getClientAddress();
	if (!addr.startsWith('127')) {
		const [close, db] = await redis();
		const res = await db.sAdd(
			'rkv',
			timestamp(new Date()) + ' - ' + addr + ' - ' + (await request.text())
		);
		close();
	}
	return new Response();
};
