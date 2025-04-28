import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Generate hashed password for the admin account
hashPassword('AdminKigali@23').then(hashed => {
  console.log('Hashed password:', hashed);
  console.log('\nSQL to create admin user:');
  console.log(`
DELETE FROM users WHERE username = 'Ndekwe';

INSERT INTO users (
    username,
    password,
    email,
    full_name,
    user_type,
    subscription_status,
    created_at
) VALUES (
    'Ndekwe',
    '${hashed}',
    'ndekwe@sirenda.com',
    'Ndekwe Admin',
    'admin',
    'active',
    CURRENT_TIMESTAMP
);`);
}); 