(async () => {
  try {
    const path = require('path');
    const db = require(path.join(__dirname, '../dist/src/_helpers/db')).default;
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');
    const http = require('http');

    console.log('Initializing DB...');
    await db.initialize();

    const email = `smoke+${Date.now()}@example.com`;
    const token = crypto.randomBytes(20).toString('hex');
    const passwordHash = await bcrypt.hash('Password123!', 10);

    console.log('Creating test account', email);
    const account = await db.Account.create({
      title: 'Mr',
      firstName: 'Smoke',
      lastName: 'Test',
      email,
      acceptTerms: true,
      role: 'User',
      verificationToken: token,
      passwordHash
    });

    console.log('Account created id=', account.id, 'token=', token);

    // call verify endpoint
    const url = `/accounts/verify-email?token=${token}`;
    const opts = { hostname: 'localhost', port: 4000, path: url, method: 'GET' };

    console.log('Calling verify endpoint:', url);

    const res = await new Promise((resolve, reject) => {
      const req = http.request(opts, (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => resolve({ statusCode: r.statusCode, body: d }));
      });
      req.on('error', reject);
      req.end();
    });

    console.log('Verify response:', res.statusCode);
    try {
      console.log('Body:', JSON.parse(res.body));
    } catch (e) {
      console.log('Body (raw):', res.body);
    }

    // reload account
    const reloaded = await db.Account.findByPk(account.id);
    console.log('Reloaded account verified:', reloaded.verified ? reloaded.verified : null);
    console.log('Reloaded account verificationToken:', reloaded.verificationToken);

    if (reloaded.verificationToken === null && reloaded.verified) {
      console.log('SMOKE_TEST: PASS');
      process.exit(0);
    } else {
      console.error('SMOKE_TEST: FAIL');
      process.exit(2);
    }
  } catch (err) {
    console.error('SMOKE_TEST_ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
