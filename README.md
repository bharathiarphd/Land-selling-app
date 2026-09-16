# Land Selling App

A modern, mobile-first marketplace for buying and selling land, plots, and commercial properties. 

## Features

- **Public**: Home, Search, Advanced Filters, Property Details, Mock Google Maps, Seller Contact.
- **Authentication**: Login, OTP Registration, Logout, Role-based constraints (Buyer vs. Seller/Agent).
- **Buyer Features**: Favorites, Profile, Mock Notifications, Mock Messages.
- **Seller/Agent Features**: Property Listing Wizard (multi-step with photo uploads), My Properties Dashboard, Draft recovery, Status management, and Deletion.
- **Location Support**: Integrates simulated maps falling back to standard text schemas, prepared for `Google Maps JS API`.
- **Backend Ready**: Implements environment variable-based API configurations (`VITE_USE_MOCK_API`) to seamlessly swap between local prototype logic and a real `fetch`-based backend API Client.

## Technology Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules)
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Deployment**: Ready for standard static hosting (Vercel, Netlify, AWS S3)

## Folder Structure

```
src/
├── assets/         # Static global assets
├── components/     # Reusable UI components (Buttons, Inputs, Modals, Cards)
├── context/        # React Context (AuthContext)
├── data/           # Mock data and schemas
├── layouts/        # Page layouts (MainLayout, Navigation, Header)
├── pages/          # Route components (Home, Search, AddProperty, MyProperties, etc.)
├── services/       # Future API integrations and current Mock services
├── styles/         # Global CSS variables, resets, and typography
└── utils/          # Formatting, validation, and storage helpers
```

## Environment Setup

Create a `.env` file in the root directory using the `.env.example`:

```env
VITE_API_BASE_URL=https://api.example.com/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_USE_MOCK_API=true
```

> **Note**: For this Phase 12 distribution, leave `VITE_USE_MOCK_API=true` to utilize the built-in local data engine. Setting this to `false` will route calls through a standard `fetch` API Client which requires an active backend server.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Production Build

To generate the optimized static bundle:

```bash
npm run build
```

This will run TypeScript validation (`tsc -b`) and Vite's Rollup bundler. The output will be placed in the `/dist` directory.

## PWA & Deployment

The application includes a `manifest.json` and `theme-color` meta tags, ensuring it installs natively on supported mobile browsers (PWA).

**Deployment Checklist:**
- Configure SPA fallback (redirect all 404s to `index.html`).
- Ensure HTTPS is enabled.
- Verify environment variables are injected into your CI/CD pipeline.
