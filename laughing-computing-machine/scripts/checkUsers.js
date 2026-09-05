const pool = require('../config/database');

async function checkUsers() {
  const { rows } = await pool.query(`SELECT id, username, phone, balance, created_at FROM users ORDER BY id DESC LIMIT 5`);
  console.log('Latest registered users in database:', rows);
  process.exit(0);
}

checkUsers();
