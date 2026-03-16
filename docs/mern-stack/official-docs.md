# Official Documentation Links

Follow these when implementing MERN stack features.

## Node.js

- **API Reference**: https://nodejs.org/docs/latest/api/
- **Modules (ESM)**: https://nodejs.org/docs/latest/api/esm.html
- **Modules (CommonJS)**: https://nodejs.org/docs/latest/api/modules.html
- **File System**: https://nodejs.org/docs/latest/api/fs.html
- **Path**: https://nodejs.org/docs/latest/api/path.html
- **HTTP**: https://nodejs.org/docs/latest/api/http.html
- **Environment Variables**: https://nodejs.org/docs/latest/api/environment_variables.html

## Express

- **API Reference**: https://expressjs.com/en/api.html
- **Routing**: https://expressjs.com/en/guide/routing.html
- **Using Middleware**: https://expressjs.com/en/guide/using-middleware.html
- **Error Handling**: https://expressjs.com/en/guide/error-handling.html
- **Middleware List**: https://expressjs.com/en/resources/middleware.html

## MongoDB (Node.js Driver)

- **Driver Docs**: https://www.mongodb.com/docs/drivers/node/current/
- **Connect**: https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/
- **CRUD**: https://www.mongodb.com/docs/drivers/node/current/crud/
- **Aggregation**: https://www.mongodb.com/docs/drivers/node/current/fundamentals/aggregation/
- **Mongoose** (ODM, optional): https://mongoosejs.com/docs/

## React

- **React Docs**: https://react.dev
- **Hooks**: https://react.dev/reference/react
- **React Router**: https://reactrouter.com/

## Conventions to Follow

1. **Node.js**: Use async/await; avoid deprecated APIs; check deprecation list
2. **Express**: Middleware order matters; always call `next()` or send response
3. **MongoDB**: Use `ObjectId` for `_id`; close connections on shutdown
4. **React**: Use functional components; follow React docs patterns
