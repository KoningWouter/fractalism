import { nip19, SimplePool } from 'nostr-tools';
import WebSocket from 'ws';

const npub = 'npub1dh4734l2gqvh35ctpx2tlhswksayx0czk6fhkldwcuupu4xtzm4sw26l6j';
const { data: pk } = nip19.decode(npub);

console.log(`Hex Pubkey: ${pk}`);

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
      limit: 5
    });
    console.log(`Found ${events.length} events.`);
    events.forEach(e => {
      console.log(`- [${new Date(e.created_at * 1000).toISOString()}] ${e.content.slice(0, 50)}...`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    pool.close(RELAYS);
    process.exit(0);
  }
}

check();
