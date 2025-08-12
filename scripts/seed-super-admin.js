// scripts/seed-super-admin.js
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  const email = 'admin@yourapp.com';
  const password = 'supersecretpassword'; // Use a strong password

  if (!password) {
    console.error('Please provide a password.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  console.log(`Email: ${email}`);
  console.log(`Hashed Password: ${hashedPassword}`);
  console.log('\n✅ Now, use Prisma Studio or your DB client to add this user to the SuperAdmin table.');
}

createSuperAdmin();