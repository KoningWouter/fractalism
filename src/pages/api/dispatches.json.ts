import type { APIRoute } from 'astro';
import { getDispatches } from '../../lib/dispatches';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const limit = Number(url.searchParams.get('limit') || '12');
	const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 12) : 12;
	const dispatches = await getDispatches(safeLimit);

	return new Response(JSON.stringify({ dispatches }), {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'public, max-age=300',
		},
	});
};
