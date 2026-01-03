# Development Scripts

## Prerequisites

Make sure you have Node.js (v16+) installed on your system.

## Installation

1. Navigate to the project directory:
```bash
cd admin-candidate-desktop
```

2. Install dependencies:
```bash
npm install
```

## Development

1. **Start the development server with both React and Electron:**
```bash
npm run dev
```
This will start:
- Express API server on port 5000
- React development server on port 3000
- Electron desktop application

2. **Start only the React development server:**
```bash
npm start
```

3. **Start only the API server:**
```bash
npm run server
```

4. **Start only Electron (after React is running):**
```bash
npm run electron-dev
```

## Building for Production

1. **Build React app:**
```bash
npm run build
```

2. **Create Windows executable:**
```bash
npm run dist-win
```
The installer will be created in the `dist` folder.

3. **Pack without installer (for testing):**
```bash
npm run pack
```

## Project Structure

```
├── public/                 # Static files
├── src/
│   ├── components/         # React components
│   ├── pages/             # React pages/views  
│   ├── context/           # React context providers
│   ├── services/          # API services
│   ├── electron/          # Electron main process
│   ├── server/            # Express API server
│   └── database/          # Database models
├── build/                 # React build output
└── dist/                  # Electron distribution
```

## Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Candidate Login:**
- Credentials are generated when admin creates a candidate
- Mobile number verification required (currently skipped)

## Troubleshooting

1. **Port conflicts:** Make sure ports 3000 and 5000 are available
2. **Database issues:** Delete `src/database/app.db` to reset
3. **Build issues:** Clear node_modules and run `npm install` again
4. **Electron issues:** Make sure you have the required build tools for your platform

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/admin/candidates` - List candidates
- `POST /api/admin/create-candidate` - Create candidate
- `POST /api/admin/upload-task` - Upload task
- `GET /api/candidate/tasks` - Get candidate tasks
- `GET /api/candidate/download/:taskId` - Download task
- `POST /api/candidate/submit/:taskId` - Submit task