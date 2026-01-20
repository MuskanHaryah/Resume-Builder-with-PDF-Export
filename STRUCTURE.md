# Resume Builder - Project Structure

## Frontend (`/frontend`)

```
src/
├── components/          # React components
│   ├── common/         # Shared components (Header, Footer, Buttons)
│   ├── manual/         # Manual mode form components
│   ├── ai/             # AI mode components
│   └── preview/        # Resume preview components
├── pages/              # Page components (Landing, Builder, Success)
├── services/           # API service functions
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
└── assets/             # Images, fonts, etc.
```

## Backend (`/backend`)

```
backend/
├── routes/             # API route definitions
├── controllers/        # Request handlers
├── services/           # Business logic (AI, PDF generation)
├── utils/              # Helper functions (ATS calculator)
└── server.js           # Main server file
```

## Dependencies

### Frontend
- React + Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (icons)

### Backend
- Express
- PDFKit
- CORS
- Google Generative AI (Gemini)
- dotenv
