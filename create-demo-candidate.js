const Database = require('./src/database/Database');
const bcrypt = require('bcryptjs');

async function createDemoCandidate() {
  console.log('Creating demo candidate...');
  
  const db = new Database();
  
  // Wait a bit for database initialization
  setTimeout(async () => {
    try {
      const demoCandidate = {
        username: 'demo_candidate',
        password_hash: await bcrypt.hash('demo123', 10),
        email: 'demo@candidate.com',
        mobile: '1234567890',
        role: 'candidate'
      };
      
      const candidateId = await db.createUser(demoCandidate);
      
      console.log('✅ Demo candidate created successfully!');
      console.log('');
      console.log('=== DEMO CANDIDATE LOGIN CREDENTIALS ===');
      console.log('Username: demo_candidate');
      console.log('Password: demo123');
      console.log('Mobile: 1234567890');
      console.log('Email: demo@candidate.com');
      console.log('=========================================');
      console.log('');
      console.log('Use these credentials to login as a candidate in the application.');
      
      db.close();
      process.exit(0);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        console.log('✅ Demo candidate already exists!');
        console.log('');
        console.log('=== DEMO CANDIDATE LOGIN CREDENTIALS ===');
        console.log('Username: demo_candidate');
        console.log('Password: demo123');
        console.log('Mobile: 1234567890');
        console.log('Email: demo@candidate.com');
        console.log('=========================================');
      } else {
        console.error('Error creating demo candidate:', error);
      }
      db.close();
      process.exit(0);
    }
  }, 2000);
}

createDemoCandidate();