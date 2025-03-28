# WhaleTA

A real-time cryptocurrency price tracking application with a modern React frontend and Node/Express backend.

## Project Structure

```
WhaleTA/
├── frontend/           # React TypeScript frontend
│   ├── src/            # Source code
├── backend/            # Python FastAPI backend
│   ├── src/            # Backend source code
└── docker-compose.yml  # Docker configuration
```

## Prerequisites

- Docker and Docker Compose
- Node.js - for local frontend development

## How to start 

1. Clone the repository:

2. Start the application using Docker Compose:
```bash
docker-compose up
```
3. Run frontend and backend 
### Frontend 
```bash
cd frontend
npm i
npm run test
npm run start
```

### Backend
```bash
cd backend
npm i
npm run test
npm run start:dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5005