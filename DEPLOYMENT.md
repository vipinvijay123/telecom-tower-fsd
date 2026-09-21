# Automated One-Click Deployment Guide

This project includes pre-configured deployment files for **Vercel** (Frontend) and **Render** (Backend API), plus a **GitHub Actions CI/CD Pipeline**.

---

## 📁 Pre-Configured Deployment Files Created

1. [`client/vercel.json`](file:///d:/telecom-tower-fsd/client/vercel.json) — Configures SPA routing, security headers, and build output for Vercel.
2. [`render.yaml`](file:///d:/telecom-tower-fsd/render.yaml) — Render Infrastructure-as-Code Blueprint spec for automated backend deployment.
3. [`.github/workflows/ci-cd.yml`](file:///d:/telecom-tower-fsd/.github/workflows/ci-cd.yml) — GitHub Actions pipeline that automatically runs linting, builds, and backend API integration tests on every push.

---

## 🚀 2-Minute Deployment Steps

### Step 1: Push Project to GitHub

```bash
git add .
git commit -m "Add Vercel and Render automated deployment configuration"
git push origin main
```

---

### Step 2: Deploy Backend API to Render (0 Manual Config)

1. Go to [Render Dashboard Blueprint](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Select your GitHub repository.
4. Render will automatically read [`render.yaml`](file:///d:/telecom-tower-fsd/render.yaml) and configure your Node.js + TypeScript server!
5. Enter your MongoDB Atlas connection string when prompted:
   - `MONGODB_URI`: `mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/telecom_tower_db?retryWrites=true&w=majority`
6. Click **Apply**. Your backend will deploy live at:
   `https://telecom-tower-backend.onrender.com`

---

### Step 3: Deploy Frontend App to Vercel (0 Manual Config)

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Select your GitHub repository.
3. Set **Root Directory** to `client`. Vercel auto-detects `client/vercel.json`!
4. Add 1 Environment Variable:
   - `VITE_API_BASE_URL`: `https://telecom-tower-backend.onrender.com/api`
5. Click **Deploy**. Your frontend is now live globally!

---

## ⚡ Seed Production Database

To seed initial towers, battery systems, and admin accounts on your production database, run:

```bash
cd server
MONGODB_URI="your_mongodb_atlas_uri" npm run seed
```

Production Credentials:
- **Admin**: `admin@telecom.com` / `Admin@1234`
- **Operator**: `operator@telecom.com` / `Operator@1234`
- **Technician**: `priya@telecom.com` / `Tech@1234`
