# Ghost Track — Live Location Intelligence System

> **Educational & Ethical Hacking Demonstration Tool**
>
> Ghost Track is a live location tracking and geospatial intelligence web application built for cybersecurity education, penetration testing demonstrations, and security awareness seminars.

---

## ⚡ Features

- **Hacker-Themed Operations Dashboard**: Real-time operations center with live clock, target statistics, activity log, and searchable target grid.
- **Google Maps Integration**:
  - Google Maps Satellite & Hybrid (high-res satellite + street names)
  - Google Maps Roadmap & Terrain
  - Layer switcher and direct one-click pin on Google Maps
- **Real-Time Geolocation Tracking**: WebSocket-powered live coordinates with dynamic updates, accuracy circles, and movement trails.
- **Security Hardened**:
  - Server-side rate limiting on incoming telemetry (60 req/min per target)
  - Strict input validation and coordinate bounds checking
  - `httpOnly` and `sameSite` authentication cookies
  - Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
  - Express fingerprint removal (`X-Powered-By` stripped)
- **Built-in Cloud Tunnel**: Automated Cloudflare tunnel integration for remote deployment testing.

---

## 🛠️ Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

---

## 🚀 Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd live-location-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```
   *For development with auto-reload:*
   ```bash
   npm run dev
   ```

4. **Access the portal**:
   - Operations Center: `http://localhost:6589/`
   - Default Username: `admin`
   - Default Password: `admin`

---

## 🔐 Environment Variables

You can customize credentials and port without altering code using environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `6589` | Server port |
| `ADMIN_USER` | `admin` | Operations center login username |
| `ADMIN_PASSWORD` | `admin` | Operations center login password |
| `ADMIN_TOKEN` | `ca9781...` | Session cookie authentication token |
| `PUBLIC_URL` | Auto (Cloudflare) | Custom public domain URL (for cloud deployment) |

---

## 🌐 Deploying to Cloud Platforms (Render, Railway, Fly.io, VPS)

Because this application uses a Node.js backend with WebSockets (Socket.IO):

1. **Push to GitHub** (follow the steps below).
2. Connect your GitHub repository to a hosting platform that supports Node.js (e.g., [Render](https://render.com), [Railway](https://railway.app), or any VPS).
3. Set the **Build Command** to:
   ```bash
   npm install
   ```
4. Set the **Start Command** to:
   ```bash
   npm start
   ```
5. Configure your environment variables (`ADMIN_USER`, `ADMIN_PASSWORD`, etc.) in your hosting provider's dashboard.

---

## ⚠️ Disclaimer

This tool is developed for educational purposes, authorized security testing, and awareness demonstrations only. Unauthorized tracking of individuals without explicit consent violates privacy laws and terms of service.