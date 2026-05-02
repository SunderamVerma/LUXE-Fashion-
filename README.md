# LUXÉ Fashion — Full‑Stack E‑Commerce

This repository is a React + Express + MongoDB demo storefront. It includes a working product catalog, cart, wishlist, checkout, dashboard, admin UI, and seed scripts for local development.

## What’s included
- Frontend React app in `src/`
- Express backend in `backend/src/`
- MongoDB models for users, products, orders, and categories
- Seed scripts for demo users/orders and the full 1000-product catalog
- Dashboard address CRUD with backend persistence

## Project layout
- `src/` — React frontend
- `backend/` — Node/Express API and scripts
- `src/data/products.js` — full product dataset used by the product seeder
- `backend/src/scripts/seedDemo.js` — demo seed script
- `backend/src/scripts/seedProducts.js` — full product catalog seeder

## Local setup

### 1. Install dependencies
```bash
git clone https://github.com/your-username/luxe-fashion.git
cd luxe-fashion
npm install
cd backend
npm install
```

### 2. Configure environment variables
Create `backend/.env` and do not commit it.

```env
MONGO_URI=mongodb://localhost:27017/luxe-fashion
JWT_SECRET=replace_with_a_secure_string
PORT=5000
# Optional if you move uploads to cloud storage:
# CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3. Seed demo data
```powershell
cd backend
npm run seed:demo
npm run seed:products -- --reset
```

`seed:demo` creates demo users and one order. `seed:products` loads the full 1000-product catalog.

### 4. Run locally
Open two terminals:

Backend:
```powershell
cd backend
npm run dev
```

Frontend:
```powershell
cd ..
npm start
```

Open `http://localhost:3000`.

## Demo credentials
- Admin: `admin@demo.com` / `admin123`
- User: `user@demo.com` / `user123`

## Hosting

### Free frontend hosting
- Vercel
- Netlify

Use:
- Build command: `npm run build`
- Output folder: `build`

### Free backend hosting
- Render
- Railway
- Fly.io

Set these env vars in the host dashboard:
- `MONGO_URI`
- `JWT_SECRET`
- `PORT` if required by the host

### Free database hosting
- MongoDB Atlas free tier

### File uploads
The app currently stores uploads locally in `backend/uploads/`. For production hosting, move uploads to Cloudinary or S3 because cloud hosts usually do not keep local files permanently.

## Important environment variables
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — auth token signing secret
- `PORT` — backend port
- `CLOUDINARY_URL` — optional upload storage config
- `REACT_APP_API_BASE_URL` — frontend API URL on the hosting platform

## Seeding notes
- `npm run seed:demo` seeds demo accounts and a sample order.
- `npm run seed:products -- --reset` loads the full product catalog from `src/data/products.js`.

## Troubleshooting
- `EADDRINUSE`: another process is already using the backend port.
- Empty Compass collections: re-run the seed scripts and make sure Compass is connected to the same `MONGO_URI`.
- Missing uploads after deployment: switch to cloud storage.

## Next recommended step before production
Wire `addresses` into `AppContext` for centralized hydration/sync and move uploads off the local filesystem.
