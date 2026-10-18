# ✉️ Postmarked

**Postmarked** — a time capsule for your future self. Write a letter, choose a delivery date, and receive it by email when the time comes.

## 🌐 Live Demo

- **Frontend:** [postmarked-five.vercel.app](https://postmarked-five.vercel.app/)
- **Backend API:** [Health Check](https://postmarked.onrender.com/api/health)

## ✨ Features

- 🔐 Authentication with JWT in httpOnly cookies
- 💌 Write and schedule letters to your future self
- 🔒 Letters remain sealed until delivery
- 📬 Automated email delivery with Nodemailer
- ⏰ Scheduled tasks with node-cron

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** PostgreSQL, Prisma
- **Auth:** JWT, httpOnly cookies
- **Email & Scheduling:** Nodemailer, node-cron

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker or PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/postmarked.git
cd postmarked
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Configure `DATABASE_URL`, `JWT_SECRET`, and other environment variables in `server/.env`.

```bash
npx prisma db push
npm run dev
```

### 4. Set up the frontend

In a new terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## 📧 Email Configuration

For local development, use `MAIL_DRIVER=console` to print delivered letters in the terminal.

To send real emails, configure SMTP credentials in `server/.env`.

## ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL

## 📄 License

Add a license if you intend to make this project open source.
