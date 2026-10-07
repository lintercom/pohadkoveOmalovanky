import { DatabaseSync } from 'node:sqlite';
// Local durable adapter for integration tests/pilot development, never a Cloudflare import.
// Production must provide an equivalent serialized transactional adapter.
export function openStore(filename){
 const db=new DatabaseSync(filename);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS app_state(id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL);');
 db.prepare('INSERT OR IGNORE INTO app_state(id,value) VALUES(1,?)').run(JSON.stringify({orders:{},events:{},audit:[],metrics:{}}));
 return {transaction(fn){db.exec('BEGIN IMMEDIATE');try{const state=JSON.parse(db.prepare('SELECT value FROM app_state WHERE id=1').get().value);const value=fn(state);if(value?.then)throw Error('TRANSACTION_MUST_BE_SYNCHRONOUS');db.prepare('UPDATE app_state SET value=? WHERE id=1').run(JSON.stringify(state));db.exec('COMMIT');return value;}catch(e){db.exec('ROLLBACK');throw e;}},close(){db.close();},backup(destination){db.prepare('VACUUM INTO ?').run(destination);}};
}
