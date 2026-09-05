const pool = require('../config/database');

async function resetDummyBalances() {
  try {
    const res = await pool.query(`UPDATE users SET balance = 0 WHERE balance = 10000 RETURNING id, username, phone, balance`);
    console.log(`Updated ${res.rowCount} users with 10000 balance to 0:`, res.rows);
    process.exit(0);
  } catch (e) {
    console.error('Reset error:', e);
    process.exit(1);
  }
}

resetDummyBalances();
