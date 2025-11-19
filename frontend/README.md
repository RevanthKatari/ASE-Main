# Windsor Community Hub – Frontend

Angular 17 single-page application that consumes the Flask REST API. Provides sign-in/register, housing listings, and community events views.

## Prerequisites

- Node.js 18+ (`winget install OpenJS.NodeJS.LTS` or download from [nodejs.org](https://nodejs.org/))
- Backend API running locally at `http://localhost:5000` (see repository root `README.md`)

## Install dependencies

```powershell
cd frontend/windsor-community-hub
npm install
```

## Development server

```powershell
npm start
```

The app will be available at `http://localhost:4200/`. It proxies directly to the Flask API (`environment.development.ts` points to `http://localhost:5000/api`).

## Build for production

```powershell
npm run build
```

Build artifacts are output to `dist/windsor-community-hub`.

## Key features

- **Authentication** – standalone `LoginComponent` handles register/sign-in, stores user in `localStorage`, and updates nav state.
- **Housing listings** – `ListingsComponent` fetches listings, renders cards with verification status, and lets authenticated users submit new listings.
- **Events** – `EventsComponent` lists upcoming events and allows authenticated users to schedule new ones with date/time picker.
- **Responsive shell** – top navigation shows active route, user info, and sign-out button; footer summarises project purpose.

Source layout (selected files):

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── features/
│   │   ├── auth/login.component.*
│   │   ├── listings/listings.component.*
│   │   └── events/events.component.*
│   ├── app.component.*
│   └── app.routes.ts
└── environments/
    ├── environment.development.ts
    └── environment.ts
```

## Next improvements

- Add route guards instead of template prompts for authenticated-only flows.
- Surface validation errors from the API (e.g., duplicate email) in the form inputs.
- Build lightweight moderation tools once evidence supports volunteer workflows.
