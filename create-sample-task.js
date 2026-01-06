const Database = require('./src/database/Database');
const fs = require('fs');
const path = require('path');

const db = new Database();

setTimeout(async () => {
  try {
    // Get demo_candidate user
    db.db.get(
      'SELECT id FROM users WHERE username = ?',
      ['demo_candidate'],
      async (err, user) => {
        if (err) {
          console.error('Error finding user:', err);
          db.db.close();
          process.exit(1);
        }

        if (!user) {
          console.error('demo_candidate user not found');
          db.db.close();
          process.exit(1);
        }

        // Create a simple sample task ZIP
        const sampleZipPath = path.join(__dirname, 'src/uploads/tasks/sample-project-task.zip');
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.dirname(sampleZipPath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Create a simple text file as task
        const taskContent = `
=== Sample Project Task ===

Project: Build a React Component Library

Description:
Create a reusable component library with the following components:
1. Button Component
2. Card Component
3. Modal Component
4. Form Input Component

Requirements:
- Use React Hooks
- Include prop validation (PropTypes)
- Write unit tests using Jest
- Create Storybook stories for each component
- Document each component with JSDoc comments

Deadline: Please complete by the deadline specified in your dashboard.

Good luck! Contact your administrator if you have any questions.
`;

        fs.writeFileSync(sampleZipPath, taskContent);

        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7); // 7 days from now

        db.db.run(
          `INSERT INTO tasks (task_name, description, zip_path, assigned_to, created_by, deadline, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'React Component Library',
            'Build a reusable React component library with Button, Card, Modal, and Form Input components. Include tests and documentation.',
            sampleZipPath,
            user.id,
            1, // Assuming admin user has id 1
            deadline.toISOString(),
            'assigned'
          ],
          function (err) {
            if (err) {
              console.error('Error creating task:', err);
            } else {
              console.log('✅ Sample task created successfully!');
              console.log(`Task ID: ${this.lastID}`);
              console.log(`Assigned to: demo_candidate`);
              console.log(`Deadline: ${deadline.toDateString()}`);
            }
            db.db.close();
            process.exit(0);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    db.db.close();
    process.exit(1);
  }
}, 1000);
