#!/bin/bash
# MERN Stack Scaffold Script
# Usage: ./scaffold.sh <project-name>
# Run from parent directory: bash docs/mern-stack/scaffold.sh my-mern-app

PROJECT_NAME=${1:-my-mern-app}

echo "Creating MERN project: $PROJECT_NAME"

mkdir -p "$PROJECT_NAME"/{client,server/src/{config,modules/{auth,user},middlewares,utils}}
cd "$PROJECT_NAME"

# Root
npm init -y

# Server
cd server
npm init -y
npm install express mongodb cors dotenv
npm install -D nodemon

mkdir -p src/config src/modules/auth src/modules/user src/middlewares src/utils
touch src/app.js index.js src/config/db.js src/config/env.js
touch src/middlewares/errorHandler.js src/middlewares/auth.middleware.js
touch src/modules/auth/auth.controller.js src/modules/auth/auth.service.js src/modules/auth/auth.routes.js
touch src/modules/user/user.controller.js src/modules/user/user.service.js src/modules/user/user.routes.js src/modules/user/user.model.js
touch .env .env.example

# Add server scripts
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json'));
pkg.scripts = { start: 'node index.js', dev: 'nodemon index.js' };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

cd ..

# Client (Vite + React)
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom

cd ..
echo "Done! Next: cd $PROJECT_NAME/server && npm run dev (in one terminal)"
echo "       cd $PROJECT_NAME/client && npm run dev (in another)"
