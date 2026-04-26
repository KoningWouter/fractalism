import { SimplePool, nip19 } from 'nostr-tools';

export interface ForumPost {
	id: string;
	pubkey: string;
	content: string;
	published: string;
	authorName?: string;
	url: string;
}

const RELAYS = [
	'wss://relay.damus.io',
	'wss://nos.lol',
	'wss://relay.primal.net',
	'wss://relay.snort.social',
	'wss://relay.nostr.band',
	'wss://nostr.mom',
];

const FORUM_HASHTAG = 'Oubliette';

export async function getForumPosts(limit = 20): Promise<ForumPost[]> {
	console.log('Fetching forum posts for #Oubliette...');
	const pool = new SimplePool();
	
	try {
		// Reverting to querySync as it was working before, but with higher limit
		const events = await pool.querySync(RELAYS, {
			kinds: [1],
			'#t': [FORUM_HASHTAG, FORUM_HASHTAG.toLowerCase()],
			limit: 100,
		});
		
		console.log(`Found ${events.length} events on relays.`);
		pool.close(RELAYS);

		return events
			.sort((a, b) => b.created_at - a.created_at)
			.slice(0, limit)
			.map((event) => ({
				id: event.id,
				pubkey: event.pubkey,
				content: event.content.trim(),
				published: new Date(event.created_at * 1000).toISOString(),
				url: `https://njump.me/${nip19.noteEncode(event.id)}`,
			}));
	} catch (error) {
		console.error('Error fetching forum posts:', error);
		pool.close(RELAYS);
		return [];
	}
}
