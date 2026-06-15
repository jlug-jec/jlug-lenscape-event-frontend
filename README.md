# Lenscape — Art Exhibition & Voting Platform

An immersive web platform for discovering, sharing, and voting on artwork across multiple creative disciplines. Built for the JLUG Lenscape event, Lenscape features a stunning 3D interface, seamless user authentication, and admin controls for content moderation.

## 🎨 Features

- **Artwork Gallery** — Browse and vote on submissions across multiple categories
  - Photography (Portrait, Landscape)
  - Digital Art (Concept Art, Character Design)
  - Cinematography (Short Films, Travel Films)
  - Motion Graphics (Logo Animation, Explainer Videos)
- **User Authentication** — Secure signup and login with Firebase Auth
- **Artist Profiles** — Create and customize your artist profile with bio and avatar
- **Artwork Submission** — Upload artwork with images, videos, descriptions, and metadata
- **Voting System** — Vote on artworks with real-time vote count updates
- **Admin Dashboard** — Approve/reject submissions and manage the platform
- **Immersive UI** — 3D backgrounds, particle effects, spotlight cursor, smooth scrolling, and more
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Firebase project with Firestore and Authentication enabled
- `.env` file with Firebase credentials (see [Configuration](#configuration))

### Installation

1. Clone the repository:
```bash
git clone <https://github.com/jlug-jec/jlug-lenscape-event-frontend.git>
make sure to be on the master branch 
cd jlug-lenscape-event-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The app auto-reloads as you make changes.

### Build

Create an optimized production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── UI/             # Modal dialogs and toasts
│   ├── ArtworkFrame.tsx
│   ├── ExhibitionNav.tsx
│   ├── ThreeBackground.tsx    # 3D background effects
│   └── ...
├── pages/              # Route pages
│   ├── LandingPage.tsx
│   ├── GalleryPage.tsx
│   ├── SubmitPage.tsx
│   ├── AdminPage.tsx
│   └── ...
├── context/            # React context for global state
├── store/              # Zustand state management
├── lib/                # Utilities and Firebase config
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── App.tsx             # Main app component
```

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **3D Graphics:** Three.js with React Three Fiber
- **State Management:** Zustand
- **Routing:** React Router v7
- **Backend & Auth:** Firebase
- **Animations:** Framer Motion, GSAP
- **Smooth Scrolling:** Lenis
- **UI Icons:** Lucide React
- **Spreadsheet Export:** XLSX

## 📄 Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 🚢 Deployment

This project is deployed on **Vercel**. See the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run start` | Start production server |

## 🔐 Security

- Sensitive credentials (Firebase config, API keys) are stored in `.env` and are never committed to version control
- Admin routes are protected and require authentication
- Firebase Security Rules enforce data access policies

## 📦 Dependencies

### Main Dependencies
- **react** & **react-dom** — UI library
- **react-router-dom** — Client-side routing
- **firebase** — Backend and authentication
- **three** — 3D graphics library
- **@react-three/fiber** & **@react-three/drei** — React wrappers for Three.js
- **framer-motion** & **gsap** — Animation libraries
- **tailwindcss** — Utility-first CSS framework
- **zustand** — Lightweight state management

See `package.json` for the complete list.

## 🎯 Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/gallery` | Artwork gallery & voting |
| `/auth/signup` | User registration |
| `/auth/login` | User login |
| `/profile` | User profile page |
| `/profile/setup` | Profile setup/edit |
| `/submit` | Submit artwork |
| `/admin` | Admin dashboard (protected) |
| `/admin/login` | Admin login (protected) |

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is part of the JLUG Lenscape event. All rights reserved.
