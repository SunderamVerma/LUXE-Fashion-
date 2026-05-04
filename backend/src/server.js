const dotenv = require('dotenv');
const connectDatabase = require('./config/db');
const app = require('./app');
const Product = require('./models/Product');
const Category = require('./models/Category');
const seedProducts = require('./scripts/seedProducts');

dotenv.config();

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  const [productCount, categoryCount] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);

  if (productCount === 0) {
    const result = await seedProducts({ connectDb: false });
    console.log(`Auto-seeded catalog: ${result.productsSeeded} products, ${result.categoriesSeeded} categories`);
  } else if (categoryCount === 0) {
    console.warn('Catalog already has products, but categories are missing. Run the product seed manually to restore them.');
  }

  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});