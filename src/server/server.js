const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const Database = require('../database/Database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const tasksDir = path.join(uploadsDir, 'tasks');
const submissionsDir = path.join(uploadsDir, 'submissions');

async function ensureDirectoryExists(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }
}

ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(tasksDir);
ensureDirectoryExists(submissionsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadType = req.route.path.includes('submit') ? submissionsDir : tasksDir;
    cb(null, uploadType);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Utility function to generate random credentials
const generateCredentials = () => {
  const adjectives = ['Swift', 'Bright', 'Quick', 'Smart', 'Bold', 'Wise', 'Cool', 'Fast'];
  const nouns = ['Tiger', 'Eagle', 'Wolf', 'Lion', 'Bear', 'Fox', 'Hawk', 'Star'];
  const randomNum = Math.floor(Math.random() * 1000);
  
  const username = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                   nouns[Math.floor(Math.random() * nouns.length)] + 
                   randomNum;
  
  const password = Math.random().toString(36).slice(-8);
  
  return { username, password };
};

// Utility function to validate ZIP file
const validateZipFile = async (filePath, minFiles = 5) => {
  try {
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();
    
    if (zipEntries.length < minFiles) {
      return { 
        valid: false, 
        error: `ZIP file must contain at least ${minFiles} files. Found: ${zipEntries.length}` 
      };
    }
    
    return { 
      valid: true, 
      fileCount: zipEntries.length,
      files: zipEntries.map(entry => entry.entryName)
    };
  } catch (error) {
    return { 
      valid: false, 
      error: 'Invalid or corrupted ZIP file' 
    };
  }
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, mobile } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For candidates, check mobile number (OTP validation skipped for now)
    if (user.role === 'candidate') {
      if (!mobile) {
        return res.status(400).json({ error: 'Mobile number is required for candidates' });
      }
      
      if (user.mobile && user.mobile !== mobile) {
        return res.status(401).json({ error: 'Mobile number does not match' });
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Log activity
    await db.logActivity(
      user.id, 
      'login', 
      `User logged in successfully`, 
      req.ip, 
      req.get('User-Agent')
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        mobile: user.mobile
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/candidates', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const candidates = await db.getAllCandidates();
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

app.post('/api/admin/create-candidate', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    
    if (!name || !email || !mobile) {
      return res.status(400).json({ error: 'Name, email, and mobile are required' });
    }
    
    // Generate credentials
    const { username, password } = generateCredentials();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userId = await db.createUser({
      username,
      password_hash: hashedPassword,
      email,
      mobile,
      role: 'candidate'
    });
    
    // Log activity
    await db.logActivity(
      req.user.id,
      'create_candidate',
      `Created candidate: ${username} (${email})`,
      req.ip,
      req.get('User-Agent')
    );
    
    // In production, you would send email here
    console.log(`New candidate created:
      Name: ${name}
      Username: ${username}
      Password: ${password}
      Email: ${email}
      Mobile: ${mobile}
    `);
    
    res.json({
      message: 'Candidate created successfully',
      candidate: {
        id: userId,
        username,
        password, // Only return in development
        email,
        mobile
      }
    });
    
  } catch (error) {
    console.error('Create candidate error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  }
});

app.post('/api/admin/upload-task', authenticateToken, authorizeRole(['admin']), upload.single('zipFile'), async (req, res) => {
  try {
    const { taskName, description, assignedTo, deadline } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'ZIP file is required' });
    }
    
    if (!taskName || !assignedTo || !deadline) {
      return res.status(400).json({ error: 'Task name, assigned user, and deadline are required' });
    }
    
    // Validate ZIP file
    const validation = await validateZipFile(req.file.path);
    if (!validation.valid) {
      await fs.unlink(req.file.path); // Delete invalid file
      return res.status(400).json({ error: validation.error });
    }
    
    // Create task record
    const taskId = await db.createTask({
      task_name: taskName,
      description: description || '',
      zip_path: req.file.path,
      assigned_to: parseInt(assignedTo),
      created_by: req.user.id,
      deadline: new Date(deadline).toISOString()
    });
    
    // Log activity
    await db.logActivity(
      req.user.id,
      'create_task',
      `Created task: ${taskName} (assigned to user ${assignedTo})`,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({
      message: 'Task created and assigned successfully',
      task: {
        id: taskId,
        taskName,
        description,
        assignedTo,
        deadline,
        fileInfo: {
          filename: req.file.filename,
          size: req.file.size,
          fileCount: validation.fileCount
        }
      }
    });
    
  } catch (error) {
    console.error('Upload task error:', error);
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to upload and assign task' });
  }
});

app.get('/api/admin/tasks', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const tasks = await db.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Candidate Routes
app.get('/api/candidate/tasks', authenticateToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    const tasks = await db.getTasksForUser(req.user.id);
    res.json(tasks);
  } catch (error) {
    console.error('Get candidate tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/candidate/download/:taskId', authenticateToken, authorizeRole(['candidate']), async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Get task details
    const tasks = await db.getTasksForUser(req.user.id);
    const task = tasks.find(t => t.id === parseInt(taskId));
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }
    
    // Check if file exists
    try {
      await fs.access(task.zip_path);
    } catch (error) {
      return res.status(404).json({ error: 'Task file not found on server' });
    }
    
    // Track download
    await db.trackDownload(req.user.id, parseInt(taskId));
    await db.updateTaskStatus(parseInt(taskId), 'downloaded');
    
    // Log activity
    await db.logActivity(
      req.user.id,
      'download_task',
      `Downloaded task: ${task.task_name}`,
      req.ip,
      req.get('User-Agent')
    );
    
    // Send file
    const filename = `${task.task_name.replace(/[^a-z0-9]/gi, '_')}_task.zip`;
    res.download(task.zip_path, filename);
    
  } catch (error) {
    console.error('Download task error:', error);
    res.status(500).json({ error: 'Failed to download task' });
  }
});

app.post('/api/candidate/submit/:taskId', authenticateToken, authorizeRole(['candidate']), upload.single('submission'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { notes } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Submission ZIP file is required' });
    }
    
    // Verify task belongs to user
    const tasks = await db.getTasksForUser(req.user.id);
    const task = tasks.find(t => t.id === parseInt(taskId));
    
    if (!task) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }
    
    // Check deadline
    const now = new Date();
    const deadline = new Date(task.deadline);
    if (now > deadline) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Submission deadline has passed' });
    }
    
    // Validate ZIP file (minimum 1 file for submission)
    const validation = await validateZipFile(req.file.path, 1);
    if (!validation.valid) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: validation.error });
    }
    
    // Create submission record
    await db.createSubmission({
      user_id: req.user.id,
      task_id: parseInt(taskId),
      file_path: req.file.path,
      submission_notes: notes || ''
    });
    
    // Update task status
    await db.updateTaskStatus(parseInt(taskId), 'submitted');
    
    // Log activity
    await db.logActivity(
      req.user.id,
      'submit_task',
      `Submitted task: ${task.task_name}`,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({
      message: 'Task submitted successfully',
      submission: {
        taskId: parseInt(taskId),
        submittedAt: new Date().toISOString(),
        fileCount: validation.fileCount,
        notes: notes || ''
      }
    });
    
  } catch (error) {
    console.error('Submit task error:', error);
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  db.close();
  process.exit(0);
});

module.exports = app;