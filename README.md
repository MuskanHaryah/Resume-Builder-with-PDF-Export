<div align="center">

# ✨ Resume Builder

### Build ATS-Optimized Resumes with AI-Powered Suggestions

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Google AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

</div>

---

## 🎯 About

A modern resume builder that helps you create professional, ATS-friendly resumes. Choose between **Manual Mode** for full control or **AI Mode** powered by Google Gemini for intelligent content suggestions tailored to your target job.

## ⚡ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Builder** | Generate professional summaries, experiences & skills using Gemini AI |
| 📝 **Manual Builder** | Full control over every section of your resume |
| 📊 **Real-time ATS Score** | Rule-based scoring system with detailed feedback |
| 📄 **PDF Export** | Download your resume as a clean, formatted PDF |
| 🎯 **Job Tailoring** | Paste job descriptions to get tailored AI suggestions |
| ✨ **Live Preview** | See changes instantly as you build |

## 🛠️ Tech Stack

**Frontend:** React 19 • TypeScript • Tailwind CSS • Vite • React Router

**Backend:** Node.js • Express • PDFKit • Google Generative AI

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/your-username/Resume-Builder-with-PDF-Export.git
cd Resume-Builder-with-PDF-Export

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment
# Create backend/.env and add:
# GEMINI_API_KEY=your_api_key_here

# Run the app
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 📁 Project Structure

```
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── ai/        # AI-powered form components
│       │   ├── manual/    # Manual input forms
│       │   └── preview/   # Resume preview
│       ├── pages/         # Landing, Manual & AI Builder pages
│       └── utils/         # ATS calculator & quality evaluator
│
└── backend/           # Express.js API
    ├── routes/        # AI & PDF endpoints
    └── services/      # Gemini AI integration
```

## 📸 Screenshots

*Coming soon...*

---

<div align="center">

Made with ❤️ using React & AI

</div>