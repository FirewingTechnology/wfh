const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, 'app.db');
    console.log('Database path:', dbPath);
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        // Enable foreign key constraints
        this.db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('Error enabling foreign keys:', err.message);
          } else {
            console.log('Foreign key constraints enabled');
          }
        });
        this.initializeTables();
      }
    });
  }

  // Initialize database tables
  async initializeTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(15),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'candidate')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )`,
      
      `CREATE TABLE IF NOT EXISTS otp_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expiry DATETIME NOT NULL,
        is_used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_name VARCHAR(255) NOT NULL,
        description TEXT,
        zip_path VARCHAR(500) NOT NULL,
        assigned_to INTEGER,
        created_by INTEGER NOT NULL,
        deadline DATETIME NOT NULL,
        status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'downloaded', 'submitted', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        submission_notes TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_evaluated BOOLEAN DEFAULT 0,
        evaluation_score INTEGER,
        evaluation_notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE(user_id, task_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        activity_description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS download_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        download_count INTEGER DEFAULT 1,
        first_download DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_download DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE(user_id, task_id)
      )`,

      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    // Create tables sequentially to avoid race conditions
    for (let i = 0; i < tables.length; i++) {
      await new Promise((resolve, reject) => {
        this.db.run(tables[i], (err) => {
          if (err) {
            console.error(`Error creating table ${i + 1}:`, err.message);
            reject(err);
          } else {
            console.log(`Table ${i + 1} created/verified successfully`);
            resolve();
          }
        });
      });
    }

    // Create default admin user after all tables are created
    setTimeout(() => {
      this.createDefaultAdmin();
    }, 1000);
  }

  // Create default admin user
  async createDefaultAdmin() {
    const defaultAdmin = {
      username: 'admin',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin'
    };

    this.db.get(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [defaultAdmin.username, defaultAdmin.email],
      async (err, row) => {
        if (err) {
          console.error('Error checking admin user:', err.message);
          return;
        }
        
        if (!row) {
          const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
          this.db.run(
            "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)",
            [defaultAdmin.username, hashedPassword, defaultAdmin.email, defaultAdmin.role],
            (err) => {
              if (err) {
                console.error('Error creating admin user:', err.message);
              } else {
                console.log('Default admin user created successfully');
                console.log('Username: admin');
                console.log('Password: admin123');
              }
            }
          );
        }
      }
    );
  }

  // User methods
  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { username, password_hash, email, mobile, role } = userData;
      this.db.run(
        "INSERT INTO users (username, password_hash, email, mobile, role) VALUES (?, ?, ?, ?, ?)",
        [username, password_hash, email, mobile, role],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM users WHERE username = ? AND is_active = 1",
        [username],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM users WHERE id = ? AND is_active = 1",
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  getAllCandidates() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT id, username, email, mobile, created_at FROM users WHERE role = 'candidate' AND is_active = 1 ORDER BY created_at DESC",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  deleteCandidate(candidateId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM users WHERE id = ? AND role = 'candidate'",
        [candidateId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  // Task methods
  createTask(taskData) {
    return new Promise((resolve, reject) => {
      const { task_name, description, zip_path, assigned_to, created_by, deadline } = taskData;
      this.db.run(
        "INSERT INTO tasks (task_name, description, zip_path, assigned_to, created_by, deadline) VALUES (?, ?, ?, ?, ?, ?)",
        [task_name, description, zip_path, assigned_to, created_by, deadline],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  getTasksForUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT t.*, u.username as assigned_to_name 
         FROM tasks t 
         LEFT JOIN users u ON t.assigned_to = u.id 
         WHERE t.assigned_to = ? 
         ORDER BY t.created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  getAllTasks() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT t.*, 
                u1.username as assigned_to_name,
                u2.username as created_by_name,
                s.submitted_at,
                CASE WHEN s.id IS NOT NULL THEN 'submitted' ELSE t.status END as current_status
         FROM tasks t 
         LEFT JOIN users u1 ON t.assigned_to = u1.id 
         LEFT JOIN users u2 ON t.created_by = u2.id
         LEFT JOIN submissions s ON t.id = s.task_id AND t.assigned_to = s.user_id
         ORDER BY t.created_at DESC`,
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  updateTaskStatus(taskId, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, taskId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  // Submission methods
  createSubmission(submissionData) {
    return new Promise((resolve, reject) => {
      const { user_id, task_id, file_path, submission_notes } = submissionData;
      this.db.run(
        "INSERT OR REPLACE INTO submissions (user_id, task_id, file_path, submission_notes) VALUES (?, ?, ?, ?)",
        [user_id, task_id, file_path, submission_notes],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Activity logging
  logActivity(userId, activityType, description, ipAddress, userAgent) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO activity_logs (user_id, activity_type, activity_description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
        [userId, activityType, description, ipAddress, userAgent],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Download tracking
  trackDownload(userId, taskId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO download_logs (user_id, task_id, download_count, first_download, last_download) 
         VALUES (?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, task_id) DO UPDATE SET
         download_count = download_count + 1,
         last_download = CURRENT_TIMESTAMP`,
        [userId, taskId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  getDownloadCount(userId, taskId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT download_count FROM download_logs WHERE user_id = ? AND task_id = ?",
        [userId, taskId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.download_count : 0);
          }
        }
      );
    });
  }

  // Session management (SQLite-based authentication)
  saveSession(userId, token, expiresAt) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
        [userId, token, expiresAt],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  getSessionByToken(token) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT s.*, u.id as user_id, u.username, u.email, u.role 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.token = ? AND s.is_active = 1 AND s.expires_at > CURRENT_TIMESTAMP`,
        [token],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  getActiveSessionByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM sessions 
         WHERE user_id = ? AND is_active = 1 AND expires_at > CURRENT_TIMESTAMP
         ORDER BY created_at DESC LIMIT 1`,
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  invalidateSession(token) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE sessions SET is_active = 0 WHERE token = ?",
        [token],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  invalidateAllUserSessions(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE sessions SET is_active = 0 WHERE user_id = ?",
        [userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  // Get submissions for a specific user
  async getSubmissionsByUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT s.*, t.task_name FROM submissions s 
         LEFT JOIN tasks t ON s.task_id = t.id 
         WHERE s.user_id = ? 
         ORDER BY s.submitted_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Close database connection
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;