import { nip19, SimplePool } from 'nostr-tools';
import WebSocket from 'ws';

const npub = 'npub1dh4734l2gqvh35ctpx2tlhswksayx0czk6fhkldwcuupu4xtzm4sw26l6j';
const { data: pk } = nip19.decode(npub);

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
  'wss://nostr.mom'
];

async function checkViral() {
  const pool = new SimplePool();
  try {
    const yesterday = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    
    // Check for Reposts (Kind 6) and Reactions (Kind 7) targetting Wouter
    const interactions = await pool.querySync(RELAYS, {
      '#p': [pk],
      kinds: [6, 7, 1],
      since: yesterday
    });
    
    const reposts = interactions.filter(e => e.kind === 6).length;
    const reactions = interactions.filter(e => e.kind === 7).length;
    const replies = interactions.filter(e => e.kind === 1 && e.tags.some(t => t[0] === 'p' && t[1] === pk)).length;

    console.log(`--- FIELD ANALYSIS (Last 24h) ---`);
    console.log(`Reposts (Kind 6): ${reposts}`);
    console.log(`Reactions (Kind 7): ${reactions}`);
    console.log(`Replies (Kind 1): ${replies}`);
    console.log(`Total Interactions: ${reposts + reactions + replies}`);
    
    // Check for mentions of the domain
    const mentions = await pool.querySync(RELAYS, {
      search: 'fractalisme.nl',
      since: yesterday
    });
    console.log(`Domain mentions: ${mentions.length}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.close(RELAYS);
    process.exit(0);
  }
}

checkViral();
