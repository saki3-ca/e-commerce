// TLS options for direct Postgres connections from the setup scripts.
// Supabase signs DB certificates with its own root CA. Download it from
// Supabase Dashboard -> Project Settings -> Database -> SSL Configuration,
// and set SUPABASE_CA_CERT=path/to/prod-ca-2021.crt in server/.env to verify.
const fs = require('fs');
const path = require('path');

module.exports = function dbSsl() {
  const caPath = process.env.SUPABASE_CA_CERT;
  if (caPath) {
    return { rejectUnauthorized: true, ca: fs.readFileSync(path.resolve(__dirname, '..', caPath), 'utf8') };
  }
  console.warn('⚠ SUPABASE_CA_CERT not set: connecting with encryption but WITHOUT certificate verification.');
  return { rejectUnauthorized: false };
};
