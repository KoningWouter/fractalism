import { fallbackDispatches, type DispatchItem } from '../data/fallbackDispatches';

const FEED_URL =
	'https://njump.me/npub1dh4734l2gqvh35ctpx2tlhswksayx0czk6fhkldwcuupu4xtzm4sw26l6j.rss';

function decodeHtml(value: string) {
	return value
		.replace(/&#34;/g, '"')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.replace(/&nbsp;/g, ' ')
		.replace(/&ldquo;/g, '“')
		.replace(/&rdquo;/g, '”')
		.replace(/&lsquo;/g, '‘')
		.replace(/&rsquo;/g, '’');
}

function stripHtml(value: string) {
	return decodeHtml(value)
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<img[^>]*>/gi, '')
		.replace(/<a [^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)')
		.replace(/<[^>]+>/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.replace(/[ \t]{2,}/g, ' ')
		.trim();
}

function getTag(block: string, tag: string) {
	const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
	return match?.[1]?.trim() ?? '';
}

function getAlternateLink(block: string) {
	const match = block.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"[^>]*\/?/i);
	return match?.[1] ?? '';
}

function toExcerpt(value: string, maxLength = 240) {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength).trimEnd()}…`;
}

function parseFeed(xml: string): DispatchItem[] {
	const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];

	return entries
		.map((entryMatch, index) => {
			const block = entryMatch[1];
			const title = stripHtml(getTag(block, 'title')) || `Dispatch ${index + 1}`;
			const content = stripHtml(getTag(block, 'content'));
			const url = getAlternateLink(block);
			const published = getTag(block, 'updated');
			const id = getTag(block, 'id') || `${published}-${index}`;
			const excerpt = toExcerpt(content || title);

			return { id, title, excerpt, url, published, rawContent: content };
		})
		.filter((item) => item.url)
		.filter((item) => item.excerpt.length > 0)
		.filter((item) => !/^repost\b/i.test(item.title))
		.filter((item) => !/^re:/i.test(item.title))
		.filter((item) => !/^in reply to\b/i.test(item.rawContent))
		.map(({ rawContent, ...item }) => item);
}

export async function getDispatches(limit = 12): Promise<DispatchItem[]> {
	try {
		const response = await fetch(FEED_URL, {
			headers: {
				'User-Agent': 'Mozilla/5.0 FractalismDispatchBot',
				Accept: 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
			},
		});

		if (!response.ok) {
			throw new Error(`Feed request failed with ${response.status}`);
		}

		const xml = await response.text();
		const parsed = parseFeed(xml).slice(0, limit);

		if (parsed.length === 0) {
			throw new Error('Feed returned no dispatches');
		}

		return parsed;
	} catch (error) {
		console.warn('Falling back to local dispatch data:', error);
		return fallbackDispatches.slice(0, limit);
	}
}

export function formatDispatchDate(value: string) {
	try {
		return new Intl.DateTimeFormat('en', {
			dateStyle: 'long',
		}).format(new Date(value));
	} catch {
		return value;
	}
}
