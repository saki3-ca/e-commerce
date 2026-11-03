// TLS options for direct Postgres connections from the setup scripts (db:setup, admin:create).
// Supabase signs DB certificates with its own root CA. Download it from
// Supabase Dashboard -> Project Settings -> Database -> SSL Configuration,
// then set SUPABASE_CA_CERT=path/to/prod-ca-2021.crt in server/.env.
// Fails closed: without the CA you must explicitly opt out with ALLOW_INSECURE_DB_TLS=1.
const fs = require('fs');
const path = require('path');

module.exports = function dbSsl() {
  const caPath = process.env.SUPABASE_CA_CERT;
  if (caPath) {
    return { rejectUnauthorized: true, ca: fs.readFileSync(path.resolve(__dirname, '..', caPath), 'utf8') };
  }
  if (process.env.ALLOW_INSECURE_DB_TLS === '1') {
    console.warn('⚠ INSECURE: database certificate is NOT being verified (ALLOW_INSECURE_DB_TLS=1).');
    return { rejectUnauthorized: false };
  }
  throw new Error(
    'Set SUPABASE_CA_CERT in server/.env (Supabase Dashboard > Project Settings > Database > SSL Configuration > Download certificate). ' +
    'To run once without verification on a trusted network, prefix the command with ALLOW_INSECURE_DB_TLS=1.'
  );
};
