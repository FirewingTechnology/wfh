const Database = require('./src/database/Database');
const fs = require('fs');
const path = require('path');

const db = new Database();

setTimeout(async () => {
  try {
    // Get demo_candidate user
    const user = await new Promise((resolve, reject) => {
      db.db.get(
        'SELECT id FROM users WHERE username = ?',
        ['demo_candidate'],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      console.error('❌ demo_candidate user not found');
      db.close();
      process.exit(1);
    }

    // Create uploads directory
    const uploadsDir = path.join(__dirname, 'src/uploads/tasks');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a sample task ZIP file with data entry instructions
    const taskZipPath = path.join(uploadsDir, 'data-entry-task.zip');
    
    const taskContent = `
=== DATA ENTRY TASK ===

Project: Customer Data Entry & Validation

Description:
You need to enter and validate customer information into the provided form.

Task Instructions:
1. Fill in all customer details accurately in the form
2. Enter personal information (Name, Email, Phone, etc.)
3. Enter address details (Street, City, Postal Code, Country)
4. Enter professional information (Profession, Service Provider, etc.)
5. Verify all IMEI numbers and phone details
6. Double-check all data before submission
7. Submit your completed form

Fields to Complete:
- Serial No
- Title (Mr., Mrs., Ms., Dr., etc.)
- First Name & Last Name
- Email Address
- Father Name
- Date of Birth (yyyy-mm-dd format)
- Gender
- Profession
- Mailing Address (Street, City, Postal Code, Country)
- Service Provider
- File No & Reference No
- SIM Number
- Type of Network
- Cell Model No
- IMEI 1 & IMEI 2
- Type of Plan
- Credit Card Type
- Contract Value
- Date of Issue & Renewal
- Installment amount
- Any remarks

Deadline: Complete within the specified time
Quality: Ensure 100% accuracy

Good luck with your data entry work!
`;

    fs.writeFileSync(taskZipPath, taskContent);
    console.log('✅ Created task file:', taskZipPath);

    // Create task record
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7 days from now

    await new Promise((resolve, reject) => {
      db.db.run(
        `INSERT INTO tasks (task_name, description, zip_path, assigned_to, created_by, deadline, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Customer Data Entry Form',
          'Complete customer information data entry with validation. Fill all form fields accurately and submit your completed work.',
          taskZipPath,
          user.id,
          1, // Assuming admin user has id 1
          deadline.toISOString(),
          'assigned'
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log('✅ Task created successfully!');
    console.log('\n=== TASK DETAILS ===');
    console.log('Task Name: Customer Data Entry Form');
    console.log('Assigned To: demo_candidate');
    console.log('Deadline:', deadline.toLocaleDateString());
    console.log('Status: Ready to download and complete');
    console.log('\nCandidate can now:');
    console.log('1. Login to the application');
    console.log('2. Download the task from Dashboard');
    console.log('3. Fill in the form with customer data');
    console.log('4. Upload their completed work');
    console.log('\nAdmin can then:');
    console.log('1. Review submitted work');
    console.log('2. Verify data accuracy');
    console.log('3. Approve/reject the submission\n');

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    db.close();
    process.exit(1);
  }
}, 1500);
