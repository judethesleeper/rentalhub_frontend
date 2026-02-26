# RentalHub Frontend (React + Vite)

This is the **frontend-only** project extracted from the original full-stack Next.js app.

## Run

1) Install deps
```bash
npm install
```

2) Create `.env` (or copy `.env.example`)
```env
VITE_API_BASE_URL=http://localhost:3001
```

3) Start the frontend
```bash
npm run dev
```

## Notes
- Routing is handled with `react-router-dom`.
- Authentication stores the JWT token in `localStorage` and sends it via `Authorization: Bearer <token>`.
