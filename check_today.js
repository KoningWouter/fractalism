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
    // Look for events from the last 24 hours
    const yesterday = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const events = await pool.querySync(RELAYS, {
      authors: [pk],
      since: yesterday
    });
    
    console.log(`Found ${events.length} events from the last 24h.`);
    events.sort((a,b) => b.created_at - a.created_at).forEach(e => {
      console.log(`- ID: ${e.id} | Kind: ${e.kind} | Date: ${new Date(e.created_at * 1000).toISOString()}`);
      console.log(`  Content: ${e.content.slice(0, 100)}...`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    pool.close(RELAYS);
    process.exit(0);
  }
}

check();
