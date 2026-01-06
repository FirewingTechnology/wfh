# Admin-Candidate Workflow Desktop Application

A secure React-based desktop application built with Electron for managing Admin-Candidate workflows with task distribution and submission.

## 🚀 Features

- **Role-based Authentication**: Secure Admin and Candidate login systems
- **Task Management**: Admins can create, assign, and track task progress
- **File Management**: Secure ZIP upload, download, and validation
- **Desktop Application**: Windows .exe installer with offline capabilities
- **Database Integration**: SQLite for local data storage with PostgreSQL migration path
- **Real-time Status Tracking**: Monitor candidate progress and submissions
- **Email Notifications**: Auto-send login credentials and task files to candidates
- **Secure Session Management**: JWT tokens stored in SQLite database

## 🛠️ Technology Stack

- **Frontend**: React 18
- **Desktop Shell**: Electron
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Authentication**: JWT + Password Hashing
- **Build Tool**: electron-builder

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd admin-candidate-desktop
   npm install
   ```

2. **Configure Email (Optional)**
   - Copy `.env.example` to `.env`
   - Add your email credentials (see [EMAIL_SETUP.md](EMAIL_SETUP.md) for details)
   - Without email config, the app runs in mock mode (logs to console)

3. **Start Development Environment**
   ```bash
   npm run dev
   ```
   This will start both the Express server and Electron app in development mode.

4. **Build for Production**
   ```bash
   npm run dist-win
   ```
   This creates a Windows .exe installer in the `dist` folder.

## 🏗️ Project Structure

```
admin-candidate-desktop/
├── src/
│   ├── components/          # React UI components
│   ├── pages/              # Main application pages
│   ├── services/           # API service calls
│   ├── utils/              # Utility functions
│   ├── electron/           # Electron main process
│   ├── server/             # Express API server
│   └── database/           # Database models and migrations
├── build/                  # React build output
├── dist/                   # Electron distribution files
├── assets/                 # Application assets
└── README.md
```

## 👤 User Roles & Workflows

### Admin Workflow
1. Login with email/username and password
2. Create new candidates with auto-generated credentials
3. Upload task ZIP files (minimum 5 files required)
4. Assign tasks to candidates with deadlines
5. Monitor candidate status and submissions

### Candidate Workflow
1. Login with username, password, and mobile number
2. OTP verification (currently skipped in development)
3. View assigned tasks and download ZIP files
4. Complete tasks offline
5. Submit completed work via ZIP upload

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT-based session management
- Role-based access control
- File isolation per candidate
- ZIP integrity validation
- Secure local storage

## 📊 Database Schema

- **users**: User accounts with role-based access
- **otp_logs**: OTP verification records
- **tasks**: Task assignments and deadlines
- **submissions**: Candidate submissions and timestamps
- **activity_logs**: User activity tracking

## 🧪 Testing

```bash
npm test
```

## 🔧 Configuration

The application uses environment variables for configuration:
- Database path
- JWT secret
- Email service settings
- File upload directories

## 📝 Usage Guide

### For Admins
1. Launch the application and login with admin credentials
2. Navigate to "Create Candidate" to add new users
3. Use "Task Management" to upload and assign ZIP files
4. Monitor progress in the candidate status dashboard

### For Candidates
1. Login using credentials provided by admin
2. Complete OTP verification
3. Download assigned task from dashboard
4. Work on tasks offline
5. Upload completed ZIP file before deadline

## 🚀 Building for Production

To create a Windows installer:

```bash
npm run dist-win
```

The installer will be created in the `dist` directory.

## 📄 License

Private - All rights reserved

## 🤝 Support

For support and questions, contact the development team.