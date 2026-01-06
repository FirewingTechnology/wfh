const Database = require('./src/database/Database');

const db = new Database();

setTimeout(() => {
  console.log('\n=== Users in Database ===');
  db.db.all('SELECT id, username, email, mobile, role FROM users;', (err, rows) => {
    if (err) {
      console.error('Error querying users:', err);
    } else {
      if (rows && rows.length > 0) {
        console.table(rows);
      } else {
        console.log('No users found in database');
      }
    }
    
    console.log('\n=== Testing demo candidate creation ===');
    // Call the demo candidate creation
    const bcrypt = require('bcryptjs');
    
    const demoCandidates = [
      {
        username: 'demo_candidate',
        password: 'demo123',
        email: 'demo@candidate.com',
        mobile: '1234567890',
        name: 'Demo Candidate'
      },
      {
        username: 'test_candidate',
        password: 'test123',
        email: 'test@candidate.com',
        mobile: '9876543210',
        name: 'Test Candidate'
      },
      {
        username: 'john_doe',
        password: 'john123',
        email: 'john@candidate.com',
        mobile: '5555555555',
        name: 'John Doe'
      }
    ];

    let created = 0;
    let skipped = 0;

    const createNext = async (index) => {
      if (index >= demoCandidates.length) {
        console.log(`\nCreated: ${created}, Skipped: ${skipped}`);
        db.db.close();
        process.exit(0);
        return;
      }

      const candidate = demoCandidates[index];
      try {
        const existing = await db.getUserByUsername(candidate.username);
        if (existing) {
          console.log(`⚠️  ${candidate.username} already exists`);
          skipped++;
        } else {
          const hashedPassword = await bcrypt.hash(candidate.password, 10);
          const userId = await db.createUser({
            username: candidate.username,
            password_hash: hashedPassword,
            email: candidate.email,
            mobile: candidate.mobile,
            role: 'candidate'
          });
          console.log(`✅ Created ${candidate.username} (ID: ${userId})`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error creating ${candidate.username}:`, error.message);
      }

      createNext(index + 1);
    };

    createNext(0);
  });
}, 1000);
