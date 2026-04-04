import { SimplePool, nip19 } from 'nostr-tools';
import { fallbackDispatches, type DispatchItem } from '../data/fallbackDispatches';

const AUTHOR_NPUB = 'npub1dh4734l2gqvh35ctpx2tlhswksayx0czk6fhkldwcuupu4xtzm4sw26l6j';
const RELAYS = [
	'wss://relay.damus.io',
	'wss://nos.lol',
	'wss://relay.primal.net',
	'wss://relay.snort.social',
];

function toExcerpt(value: string, maxLength = 240) {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength).trimEnd()}…`;
}

function normalizeContent(value: string) {
	return value.replace(/\s+/g, ' ').trim();
}

function toTitle(value: string) {
	const firstLine = value
		.split(/\n+/)
		.map((line) => line.trim())
		.find(Boolean) ?? 'Dispatch';
	return firstLine.length <= 72 ? firstLine : `${firstLine.slice(0, 72).trimEnd()}…`;
}

function isReply(tags: string[][]) {
	return tags.some((tag) => tag[0] === 'e' && (tag[3] === 'reply' || tag[3] === 'root'));
}

export async function getDispatches(limit = 12): Promise<DispatchItem[]> {
	const safeLimit = Math.min(Math.max(limit, 1), 12);

	try {
		const decoded = nip19.decode(AUTHOR_NPUB);
		if (decoded.type !== 'npub') {
			throw new Error('Expected npub author key');
		}

		const pool = new SimplePool();
		const events = await pool.querySync(RELAYS, {
			kinds: [1],
			authors: [decoded.data],
			limit: 30,
		});
		pool.close(RELAYS);

		const parsed = events
			.filter((event) => !isReply(event.tags))
			.filter((event) => !/^re:/i.test(event.content))
			.sort((a, b) => b.created_at - a.created_at)
			.slice(0, safeLimit)
			.map((event) => {
				const content = normalizeContent(event.content);
				const title = toTitle(content);
				const excerpt = toExcerpt(content || title);
				return {
					id: event.id,
					title,
					excerpt,
					url: `https://njump.me/${nip19.noteEncode(event.id)}`,
					published: new Date(event.created_at * 1000).toISOString(),
				};
			});

		if (parsed.length === 0) {
			throw new Error('Relay query returned no dispatches');
		}

		return parsed;
	} catch (error) {
		console.warn('Falling back to local dispatch data:', error);
		return fallbackDispatches.slice(0, safeLimit);
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
