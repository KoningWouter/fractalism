import { nip19, SimplePool } from 'nostr-tools';
import WebSocket from 'ws';

const pk = '6debe8d7ea401978d30b0994bfde0eb43a433f02b6937b7daec7381e54cb16eb';
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band'
];

async function analyze() {
  const pool = new SimplePool();
  try {
    const yesterday = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    
    // 1. Get interactions (Reposts, Reactions, Replies)
    const events = await pool.querySync(RELAYS, {
      '#p': [pk],
      kinds: [1, 6, 7],
      since: yesterday
    });
    
    // 2. Extract unique pubkeys of people interacting
    const authorPubkeys = [...new Set(events.map(e => e.pubkey))];
    
    // 3. Try to get their metadata (Kind 0)
    const metadatas = await pool.querySync(RELAYS, {
      authors: authorPubkeys.slice(0, 15), 
      kinds: [0]
    });
    
    const nameMap = {};
    metadatas.forEach(m => {
      try {
        const content = JSON.parse(m.content);
        nameMap[m.pubkey] = content.name || content.display_name || m.pubkey.slice(0,8);
      } catch(e) {}
    });

    console.log('--- RECENT INTERACTIONS ---');
    events.sort((a,b) => b.created_at - a.created_at).slice(0, 15).forEach(e => {
      let type = 'REACTION';
      if (e.kind === 1) type = 'REPLY';
      if (e.kind === 6) type = 'REPOST';
      
      const name = nameMap[e.pubkey] || e.pubkey.slice(0,8);
      let preview = e.content.slice(0, 60);
      if (e.kind === 7) preview = '[Like]';
      if (e.kind === 6) preview = '[Shared your post]';
      
      console.log(`[${type}] from ${name}: "${preview}..."`);
    });
    
    console.log(`\nTotal unique actors in last 24h: ${authorPubkeys.length}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.close(RELAYS);
    process.exit(0);
  }
}

analyze();
