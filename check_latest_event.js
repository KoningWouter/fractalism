import { nip19, SimplePool } from 'nostr-tools';
import WebSocket from 'ws';

const npub = 'npub1dh4734l2gqvh35ctpx2tlhswksayx0czk6fhkldwcuupu4xtzm4sw26l6j';
const { data: pk } = nip19.decode(npub);

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band'
];

async function check() {
  const pool = new SimplePool();
  try {
    const events = await pool.querySync(RELAYS, {
      authors: [pk],
      kinds: [1],
      limit: 1
    });
    
    if (events.length > 0) {
      const e = events[0];
      console.log(JSON.stringify({
        id: e.id,
        created_at: e.created_at,
        content: e.content,
        kind: e.kind,
        tags: e.tags
      }, null, 2));
    } else {
      console.log('No events found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.close(RELAYS);
    process.exit(0);
  }
}

check();
