import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

// Utility/index pages that should not appear in the feed
const EXCLUDED = new Set([
	'home',
	'essays',
	'community',
	'faq',
	'about',
	'how-to-read-fractalism',
	'team-3',
	'the-wanderer',
	'the-road-to-i-am-the-formula',
]);

export async function GET(context: APIContext) {
	const pages = await getCollection('pages');
	const articles = pages.filter((p) => !EXCLUDED.has(p.id));

	return rss({
		title: 'Fractalism',
		description:
			'A living framework for truth, resonance, reciprocity and extraction, inner sovereignty, and the rebuilding of human community beyond inversion.',
		site: context.site!,
		items: articles.map((page) => ({
			title: page.data.title,
			description: page.data.description,
			link: `/${page.id}/`,
		})),
		customData: `<language>en</language>`,
	});
}
