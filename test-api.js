const Database = require('./src/database/Database');
const jwt = require('jsonwebtoken');

const db = new Database();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Create a token for demo_candidate (user_id = 2)
const token = jwt.sign(
  { id: 2, username: 'demo_candidate', role: 'candidate' },
  SECRET_KEY,
  { expiresIn: '24h' }
);

console.log('Generated token:', token);

// Simulate the API call
db.getTasksForUser(2).then(tasks => {
  console.log('Tasks returned:', JSON.stringify(tasks, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
