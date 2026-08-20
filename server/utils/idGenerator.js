// Generates short, human-readable IDs for demo purposes (e.g. INC-204, AMB-102).
// Not cryptographically unique — fine for hackathon-scale demo data.
function generateId(prefix) {
  const num = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${prefix}-${num}`;
}

module.exports = { generateId };
