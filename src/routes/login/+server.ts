import { URLS } from '$lib/urls';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	if (url.searchParams.get('token')) cookies.set('token', url.searchParams.get('token')!);
	throw redirect(301, URLS.ABOUT);
};
