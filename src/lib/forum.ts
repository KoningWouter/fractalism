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
];

const FORUM_HASHTAG = 'Oubliette';

export async function getForumPosts(limit = 20): Promise<ForumPost[]> {
	const pool = new SimplePool();
	
	try {
		const events = await pool.querySync(RELAYS, {
			kinds: [1],
			'#t': [FORUM_HASHTAG, FORUM_HASHTAG.toLowerCase()],
			limit: limit * 2,
		});
		
		pool.close(RELAYS);

		return events
			.sort((a, b) => b.created_at - a.created_at)
			.slice(0, limit)
			.map((event) => ({
				id: event.id,
				pubkey: event.pubkey,
				content: event.content,
				published: new Date(event.created_at * 1000).toISOString(),
				url: `https://njump.me/${nip19.noteEncode(event.id)}`,
			}));
	} catch (error) {
		console.error('Error fetching forum posts:', error);
		pool.close(RELAYS);
		return [];
	}
}
