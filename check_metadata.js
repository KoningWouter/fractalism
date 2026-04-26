import { nip19, SimplePool } from 'nostr-tools';
import WebSocket from 'ws';

const npub = 'npub1dh4734l2gqvh35ctpx2tlhswksayx0czk6fhkldwcuupu4xtzm4sw26l6j';
const { data: pk } = nip19.decode(npub);

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
  'wss://nostr.mom',
  'wss://purplepag.es'
];

async function checkMetadata() {
  const pool = new SimplePool();
  try {
    console.log(`Checking metadata for Hex: ${pk}`);
    const events = await pool.querySync(RELAYS, {
      authors: [pk],
      kinds: [0],
      limit: 1
    });
    
    if (events.length > 0) {
      const e = events[0];
      console.log('--- METADATA FOUND ---');
      console.log(JSON.stringify(JSON.parse(e.content), null, 2));
      console.log(`Created at: ${new Date(e.created_at * 1000).toISOString()}`);
    } else {
      console.log('--- NO METADATA (KIND 0) FOUND ON THESE RELAYS ---');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.close(RELAYS);
    process.exit(0);
  }
}

checkMetadata();
