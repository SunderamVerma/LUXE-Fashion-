const dotenv = require('dotenv');
const connectDatabase = require('./config/db');
const app = require('./app');

dotenv.config();

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});