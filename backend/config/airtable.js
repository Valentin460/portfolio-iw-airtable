const Airtable = require('airtable');

// Configuration Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_KEY
}).base(process.env.AIRTABLE_BASE_ID);

function logAirtableCall(method, path) {
  console.log(`[AIRTABLE API] ${method} ${path}`);
}

async function airtableCall(fn, description) {
  console.log('[AIRTABLE API CALL]', description);
  return await fn();
}

module.exports = {
  base,
  logAirtableCall,
  airtableCall
};

