# MERN Stack Setup Commands (Linux / macOS Terminal)

Run these in order when scaffolding a new MERN project.

## Quick Scaffold (Automated)

```bash
# From project root
bash docs/mern-stack/scaffold.sh my-mern-app
cd my-mern-app
```

Then run server and client as below.

## 1. Prerequisites

```bash
# Check Node.js (v18+ recommended)
node -v

# Check npm
npm -v

# Install Node if needed (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## 2. Create Project Root

```bash
mkdir my-mern-app && cd my-mern-app
npm init -y
```

## 3. Backend (Server)

```bash
mkdir server && cd server
npm init -y
npm install express mongodb cors dotenv
npm install -D nodemon
```

**package.json scripts (server):**
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

**Create structure:**
```bash
mkdir -p src/config src/modules/auth src/modules/user src/middlewares src/utils
touch src/app.js index.js src/config/db.js src/config/env.js
touch src/middlewares/errorHandler.js src/middlewares/auth.middleware.js
touch src/modules/auth/auth.controller.js src/modules/auth/auth.service.js src/modules/auth/auth.routes.js
touch src/modules/user/user.controller.js src/modules/user/user.service.js src/modules/user/user.routes.js src/modules/user/user.model.js
touch .env .env.example
```

## 4. Frontend (Client - Vite + React)

```bash
cd ..
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom
```

**Or with Create React App:**
```bash
npx create-react-app client
cd client
npm install axios react-router-dom
```

## 5. Environment Files

**server/.env.example:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key
```

**client/.env.example:**
```
VITE_API_URL=http://localhost:5000/api
```

## 6. Root Scripts (Optional)

In root `package.json`:
```json
"scripts": {
  "server": "cd server && npm run dev",
  "client": "cd client && npm run dev",
  "dev": "concurrently \"npm run server\" \"npm run client\""
}
```

```bash
npm install -D concurrently
```

## 7. MongoDB (Local)

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Or use MongoDB Atlas (cloud) - set MONGODB_URI in .env
```

## 8. Run

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```
