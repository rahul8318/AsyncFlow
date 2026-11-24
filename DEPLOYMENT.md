# AsyncFlow — Production Deployment Guide

This document outlines the operational procedures for deploying AsyncFlow to production environments.

---

## 1. Production Architecture Overview

```
                      [ User Traffic / DNS ]
                                 |
                     +-----------+-----------+
                     |                       |
            [ Vercel / Cloudflare ]   [ Cloud Load Balancer / Nginx ]
             (Static Frontend SPA)                   |
                                             [ Node.js API Service ]
                                             (Express + Socket.IO)
                                            /          |          \
                                           /           |           \
                    [ Managed PostgreSQL 17 ]   [ Managed Redis ]  [ S3 Storage ]
                    (AWS RDS / Supabase / Neon)  (Upstash / Cloud) (Cloudflare R2 / AWS)
```

---

## 2. Environment Variables Specification

### Backend Variables

| Variable | Required | Example | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Set to production for logging and cookie security |
| `PORT` | Yes | `5000` | Port the HTTP/WebSocket server listens on |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/asyncflow?schema=public` | Production PostgreSQL connection string |
| `JWT_SECRET` | Yes | `[32+ character random string]` | Secret key for signing short-lived access tokens |
| `JWT_REFRESH_SECRET` | Yes | `[32+ character random string]` | Secret key for signing rotating refresh tokens |
| `JWT_EXPIRES_IN` | No | `15m` | Lifetime of access tokens |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Lifetime of refresh tokens |
| `CORS_ORIGIN` | Yes | `https://app.asyncflow.io` | Allowed frontend origin for CORS policies |
| `REDIS_ENABLED` | Yes | `true` | Enable Redis for shared caching & rate limiting |
| `REDIS_URL` | Yes | `redis://default:pass@redis-host:6379` | Connection string to Redis instance |
| `UPLOAD_DIR` | No | `./uploads` | Local upload directory path (or S3 bucket config) |
| `SMTP_HOST` | No | `smtp.sendgrid.net` | Hostname for outbound transactional emails |
| `SMTP_PORT` | No | `587` | Port for SMTP transmission |
| `SMTP_USER` | No | `apikey` | SMTP authentication user |
| `SMTP_PASS` | No | `your-secret-key` | SMTP API key |
| `SMTP_FROM` | No | `"AsyncFlow Enterprise <noreply@asyncflow.io>"` | Email sender display name |

---

## 3. Database Migration & Deployment Commands

In production CI/CD pipelines, execute:

```bash
# 1. Apply database migrations
cd backend
npx prisma migrate deploy

# 2. (Optional) Run initial baseline seed if provisioning a fresh cluster
npx tsx prisma/seed.ts
```

---

## 4. Platform Deployment Guides

### Deploying Frontend to Vercel
1. Link your GitHub repository to Vercel.
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add Rewrite in `vercel.json` to route `/api/:path*` to your backend URL:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://api.asyncflow.io/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Deploying Backend to Railway / Render / Fly.io
1. Connect repository with Root Directory set to `backend`.
2. Select Dockerfile deployment or Node.js environment.
3. Configure environment variables specified in Section 2.
4. Set Health Check path to `/health`.
5. Allocate minimum 1 CPU and 1GB RAM for high-concurrency WebSocket connections.

---

## 5. Security & Maintenance Checklist

- [x] Configure strict SSL/TLS certificates (TLS 1.3).
- [x] Rotate JWT secrets periodically and invalidate compromised refresh tokens via `/auth/logout`.
- [x] Validate that database backups (WAL archiving / daily snapshots) are configured on PostgreSQL.
- [x] Verify that CORS headers only whitelist your official domain.
- [x] Ensure file uploads enforce the 10MB limit and MIME-type restrictions.
