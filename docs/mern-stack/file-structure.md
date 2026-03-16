# MERN Stack Pre-Built File Structure

Use this structure when creating new MERN projects. Run the setup commands to scaffold.

## Root Layout

```
my-mern-app/
├── client/                 # React frontend
├── server/                  # Express + Node backend
├── shared/                  # Shared types, constants (optional)
├── .env.example
├── .gitignore
├── package.json             # Root scripts (optional)
└── README.md
```

## Server (Express + Node)

```
server/
├── src/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── env.js           # Environment variables
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   ├── user/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.routes.js
│   │   │   └── user.model.js
│   │   └── [feature]/       # Add more feature modules
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── utils/
│   │   └── helpers.js
│   └── app.js               # Express app setup
├── index.js                 # Entry point, start server
├── package.json
└── .env
```

## Client (React)

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI (Button, Input, etc.)
│   │   ├── forms/
│   │   └── layout/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── services/
│   │   └── api.js            # Axios/fetch API calls
│   ├── store/                # Context or Redux (optional)
│   ├── utils/
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js           # or create-react-app
```

## Key Files

### server/index.js
```js
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}).catch(err => console.error(err));
```

### server/src/config/db.js
```js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;

export async function connectDB() {
  client = new MongoClient(uri);
  await client.connect();
  return client.db();
}
```

### server/src/app.js
```js
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);
export default app;
```
