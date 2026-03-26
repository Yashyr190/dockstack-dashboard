# DockStack

**Containerized Deployment in Virtualized Environments**

DockStack is a lightweight container management platform that allows users to deploy applications as Docker containers running directly on the host machine via a sleek web interface. It acts as a simplified, modern container orchestration dashboard.

## System Architecture
`User → Web Dashboard (React) → Backend API (Node.js/Express) → Docker Engine (dockerode) → Containers`

## Features
- **Secure Authentication**: User signup and login utilizing JSON Web Tokens (JWT).
- **Container Lifecycle Management**: Pull container images, assign environment variables, map ports and deploy directly from the dashboard.
- **Action Controls**: Start, Stop, Restart, and entirely Delete running or exited containers.
- **Live Monitoring & Logs**: View real-time streaming CPU and Memory metrics alongside dynamic console logs.
- **Modern Aesthetics**: Rich, dark-mode focused glassmorphic UI built natively with TailwindCSS v4 and Framer Motion.

## Prerequisites

- **Docker Desktop** (or equivalent Docker Engine)
- **Docker Compose**

Since the backend container interacts directly with your host's Docker daemon, Docker engine must be running, and the daemon socket accessible.

## How to Run Locally

1. **Clone/Navigate** to the project root directory where `docker-compose.yml` resides.
2. **Launch the stack**:
   ```bash
   docker compose up --build -d
   ```
3. Wait for the containers to spin up...
   - **MongoDB** will start on port `27017`
   - **Backend API** will start on port `5000`
   - **Frontend Dashboard** will start on port `80` (accessible via `localhost`)
4. Open your browser and navigate to **[http://localhost](http://localhost)**
5. Create a new user account on the login screen to access the system.

> **Note**: For Mac/Windows Desktop users, binding `/var/run/docker.sock` will allow DockStack to interface with your host containers.

## Technology Stack

- **Frontend**: React.js (Vite), TailwindCSS v4, Lucide React, Zustand/Context, Framer Motion
- **Backend**: Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, dockerode
- **Database**: MongoDB
- **Infrastructure**: Docker, Docker Compose, NGINX

## Security Notice
This project mounts the Docker Socket directly into the backend container for orchestration purposes. Only use this configuration in secure, trusted, or local environments, as socket exposure allows root-level access to the host machine.
