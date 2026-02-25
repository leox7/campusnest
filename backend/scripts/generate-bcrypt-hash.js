import bcrypt from "bcrypt";

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error("Usage: node scripts/generate-bcrypt-hash.js \"YourStrongPassword123\"");
  process.exit(1);
}

const hash = await bcrypt.hash(plainPassword, 10);
console.log(hash);
