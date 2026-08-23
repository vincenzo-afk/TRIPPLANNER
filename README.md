<div align="center">

# TRIPPLANNER

### AI-assisted trip discovery, itinerary generation, and expense tracking in one React application.

[![CI](https://github.com/vincenzo-afk/TRIPPLANNER/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/vincenzo-afk/TRIPPLANNER/actions/workflows/ci.yml)

[Repository](https://github.com/vincenzo-afk/TRIPPLANNER) · [Report a bug](https://github.com/vincenzo-afk/TRIPPLANNER/issues/new?template=bug_report.md) · [Request a feature](https://github.com/vincenzo-afk/TRIPPLANNER/issues/new?template=feature_request.md) · Demo: not published in this repository

</div>

TRIPPLANNER is a client-side Vite and React web application that helps an authenticated user turn a few travel preferences into destination options, a saved trip, a day-by-day itinerary, and a budget-aware expense log. Firebase provides authentication and Firestore persistence, Google Gemini generates destination and itinerary content, and Unsplash supplies destination imagery when an access key is configured.

## <a name="table-of-contents"></a>Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Features & Roadmap](#features--roadmap)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Footer](#footer)

---

## <a name="about-the-project"></a>About the Project

TRIPPLANNER focuses on the early planning stages of a trip. After signing in, a user chooses a trip type, budget tier, and duration. The application sends those preferences to Gemini and requests three destination options in JSON form. Each option is enriched with a destination image from Unsplash, and selecting an option creates a trip document in Firestore.

When the saved trip is opened, TRIPPLANNER generates a day-by-day itinerary only when the trip does not already have one, then stores the generated result on the trip document. The expense view provides a numeric budget, live total-spent and progress calculations, five expense categories, and deletion for individual transactions. The dashboard lists the signed-in user’s saved trips and deletes a trip together with its expense subcollection.

### Key features

- Email/password sign-in and account creation through Firebase Authentication.
- Protected application routes for home, suggestions, saved trips, itinerary, and expenses.
- Preference-based suggestions for Beach, Mountains, or City trips with a 1–30 day duration.
- Three Gemini destination suggestions with estimated cost and descriptions.
- Unsplash destination photography with a built-in generic travel-image fallback when the key or result is unavailable.
- Cached day-by-day itinerary generation stored on the selected Firestore trip document.
- Firestore-backed trip dashboard with confirmation-based trip deletion.
- Expense creation, categorization, day assignment, deletion, editable budget limit, and over-budget indication.
- Lazy-loaded page components with a Suspense loading state.

### Application flow

```mermaid
flowchart TD
    A[User opens TRIPPLANNER] --> B{Authenticated?}
    B -- No --> C[Login or create account]
    C --> D[Home preference form]
    B -- Yes --> D
    D --> E[Gemini returns 3 destinations]
    E --> F[Unsplash adds destination image]
    F --> G[User selects destination]
    G --> H[Create trips document in Firestore]
    H --> I[Generate itinerary if missing]
    I --> J[Save itinerary on trip document]
    J --> K[View itinerary]
    K --> L[Manage expenses]
    L --> M[Listen to trips/{tripId}/expenses]
    D --> N[Dashboard]
    N --> O[Load and sort user's trips]
    O --> P[Delete trip and its expenses]
```

### Visual asset

![TRIPPLANNER application mark](src/assets/hero.png)

The repository also contains the SVG favicon and icon sprite under [`public/`](public/).

---

## <a name="tech-stack"></a>Tech Stack

The versions below are the dependency ranges declared in [`package.json`](package.json) and the resolved versions recorded in [`package-lock.json`](package-lock.json). React provides the component model, Vite provides the development server and production build, and Tailwind CSS provides the utility styling layer.[1] [2] [3]

| Area | Technology | Resolved version or role |
|---|---|---|
| Frontend | React | 19.2.5 |
| Frontend | React DOM | 19.2.5 |
| Build tooling | Vite | 8.0.9 |
| Styling | Tailwind CSS | 3.4.19 |
| Routing | React Router DOM | 7.14.1 |
| Authentication and database | Firebase | 12.12.0; Authentication and Firestore are initialized in [`src/services/firebase.js`](src/services/firebase.js) |
| Generative AI | `@google/generative-ai` | 0.24.1; Gemini destination and itinerary generation in [`src/services/ai.js`](src/services/ai.js) |
| Destination imagery | Unsplash Search API | One landscape result per destination query in [`src/services/unsplash.js`](src/services/unsplash.js) |
| Code quality | ESLint | 9.39.4; configuration in [`eslint.config.js`](eslint.config.js) |
| Continuous integration | GitHub Actions | Lint and production build in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |

Firebase supplies the managed authentication and Firestore services used by the application.[4] Gemini and Unsplash are external services and require their own credentials and account configuration.[5] [6]

---

## <a name="getting-started"></a>Getting Started

### Prerequisites

Install Node.js 22 or a compatible current LTS release and npm. The checked-in CI workflow uses Node.js 22 and installs from the lockfile with `npm ci`. You also need a Firebase project with a Web App, Email/Password Authentication enabled, and Firestore available. Gemini generation requires a Google AI API key, and Unsplash imagery requires an Unsplash access key if you want destination-specific photos.

### Installation

```bash
git clone https://github.com/vincenzo-afk/TRIPPLANNER.git
cd TRIPPLANNER
npm ci
cp .env.example .env
```

Populate `.env` with the configuration described below, then start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, normally [http://localhost:5173](http://localhost:5173).

### Environment variables

The Firebase variables are validated during application startup. Gemini and Unsplash values are read by their respective service modules. Vite exposes variables prefixed with `VITE_` to the browser bundle, so do not place server-only secrets or service-account credentials in this file.

<details>
<summary>Complete .env example</summary>

```env
# Firebase Web App configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-2.5-pro

# Unsplash Search API
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

</details>

| Variable | Required for | Description |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Application startup | Firebase Web App API key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Application startup | Firebase Authentication domain. |
| `VITE_FIREBASE_PROJECT_ID` | Application startup | Firebase project identifier. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Application startup | Firebase Web App storage bucket value. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Application startup | Firebase messaging sender identifier. |
| `VITE_FIREBASE_APP_ID` | Application startup | Firebase Web App identifier. |
| `VITE_GEMINI_API_KEY` | AI generation | Credential used by the Gemini client. |
| `VITE_GEMINI_MODEL` | Optional | Primary Gemini model. The service falls back to `gemini-1.5-flash-001` when unset and also attempts other known fallback model names when a model is not found. |
| `VITE_UNSPLASH_ACCESS_KEY` | Optional for image fallback | Unsplash access key. Without a usable key or result, the application uses a generic travel image. |

### Firebase configuration

The application code initializes Firebase Authentication and Firestore in [`src/services/firebase.js`](src/services/firebase.js). Configure the following in the Firebase console before using the app:

1. Create or select a Firebase project and register a Web App.
2. Copy the Web App configuration values into `.env`.
3. Enable Email/Password under Firebase Authentication.
4. Create or enable a Firestore database.
5. Configure Firestore Security Rules so authenticated users can access only the records your application intends to expose.

The repository does not include Firebase rules or migrations. Review and test your project rules before using real user data.

---

## <a name="usage"></a>Usage

### Create a trip

1. Open `/login` and either sign in or create an account with an email address and password.
2. On `/home`, choose one of the built-in trip types: Beach, Mountains, or City.
3. Choose Budget, Moderate, or Luxury and set a duration between 1 and 30 days.
4. Submit the form to open `/suggestions`.
5. Select one of the three generated destination cards. The selection creates a `trips` document and opens `/trip/:id`.

### Review an itinerary

The itinerary page reads the selected Firestore trip. If the `itinerary` field is missing, TRIPPLANNER requests one object per day from Gemini, writes the returned array to the trip document, and renders a timeline with morning, afternoon, and evening activity labels when those words appear in the generated activity text.

### Track expenses

Open **Manage Expenses** from `/trip/:id` or navigate directly to `/expenses/:id`. Add an amount, one of `Food`, `Transport`, `Accommodation`, `Activity`, or `Other`, a description, and a day number. The page subscribes to the trip’s expense subcollection in reverse creation order, calculates the total spent, shows progress against the editable numeric budget, and highlights an over-budget total.

### View and delete saved trips

Open `/dashboard` to view trips belonging to the current authenticated user. Trips are sorted by `createdAt` in descending order. Deleting a trip first removes documents in `trips/{tripId}/expenses` and then removes the parent trip document through [`src/services/trips.js`](src/services/trips.js).

### Routes

All routes except `/login` are protected by the `ProtectedRoute` component in [`src/App.jsx`](src/App.jsx). Unknown routes redirect to `/home`.

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Sign in or create an account with Firebase email/password authentication. |
| `/home` | Authenticated | Choose trip type, budget tier, and duration. |
| `/suggestions` | Authenticated | View three AI-generated destination options with images. |
| `/trip/:id` | Authenticated | View or generate the saved trip’s day-by-day itinerary. |
| `/expenses/:id` | Authenticated | Add, review, budget, and delete trip expenses. |
| `/dashboard` | Authenticated | Browse and delete saved trips. |

### Firestore data model

The client writes and reads the following document shapes. Firestore Security Rules are not included in this repository and must be configured in the Firebase project.

```text
trips/{tripId}
├── userId: string
├── destinationName: string
├── destinationCountry: string
├── destinationImage: string
├── budget: "Budget" | "Moderate" | "Luxury"
├── numericBudget: number
├── tripType: "Beach" | "Mountains" | "City"
├── duration: number
├── itinerary: array | absent until generated
└── createdAt: Firestore timestamp

trips/{tripId}/expenses/{expenseId}
├── amount: number
├── category: "Food" | "Transport" | "Accommodation" | "Activity" | "Other"
├── description: string
├── day: number
└── createdAt: Firestore timestamp
```

The default numeric budgets assigned when a destination is selected are 1,000 for Budget, 3,000 for Moderate, and 10,000 for Luxury. These values are client-side defaults in [`src/pages/SuggestionsPage.jsx`](src/pages/SuggestionsPage.jsx) and should not be treated as financial advice or a currency conversion system.

---

## <a name="api-reference"></a>API Reference

TRIPPLANNER is a browser application and does not expose an application-owned HTTP server or documented REST endpoints. Its integrations are called directly from the client:

| Integration | Client operation | Used by | Purpose |
|---|---|---|---|
| Firebase Authentication | Email/password sign-in and account creation | [`src/pages/LoginPage.jsx`](src/pages/LoginPage.jsx) | Authenticate the user and protect application routes. |
| Firebase Firestore | Read, create, update, subscribe, batch-delete | Pages under [`src/pages/`](src/pages/) and [`src/services/trips.js`](src/services/trips.js) | Persist trips, itineraries, and expenses. |
| Google Gemini | `generateContent` with JSON-array prompts | [`src/services/ai.js`](src/services/ai.js) | Generate three destinations and a day-by-day itinerary. |
| Unsplash Search | `GET /search/photos` with `per_page=1` | [`src/services/unsplash.js`](src/services/unsplash.js) | Find one landscape image for a destination query. |

Gemini responses are parsed as JSON arrays after extracting the first `[` and last `]` from the model response. Quota errors are normalized and displayed with a retry countdown when a retry interval is available. Unsplash failures fall back to a generic travel image.

---

## <a name="project-structure"></a>Project Structure

```text
TRIPPLANNER/
├── .github/
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE/
│   │   └── pull_request_template.md
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── ExpenseItem.jsx
│   │   ├── SkeletonCard.jsx
│   │   └── TripCard.jsx
│   ├── context/
│   │   ├── AuthProvider.jsx
│   │   └── authContext.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTrips.js
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── ExpensePage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SuggestionsPage.jsx
│   │   └── TripPage.jsx
│   ├── services/
│   │   ├── ai.js
│   │   ├── firebase.js
│   │   ├── trips.js
│   │   └── unsplash.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── SECURITY.md
├── tailwind.config.js
├── vite.config.js
└── LICENSE: not present
```

`src/main.jsx` mounts the React application and wraps it in `AuthProvider`. `src/App.jsx` defines lazy-loaded routes and authentication gating. The page modules own the user flows, while `src/services/` isolates Firebase, Gemini, Unsplash, and trip-deletion concerns.

---

## <a name="features--roadmap"></a>Features & Roadmap

### Implemented

- [x] Email/password authentication.
- [x] Protected routes and initial authentication loading state.
- [x] Beach, Mountains, and City preference selection.
- [x] Budget tier and 1–30 day duration selection.
- [x] Three Gemini destination suggestions.
- [x] Unsplash destination image lookup with fallback image.
- [x] Firestore trip persistence.
- [x] Cached AI itinerary generation.
- [x] Dashboard sorting and trip deletion with expense cleanup.
- [x] Budget tracking and expense categorization.
- [x] ESLint validation and Vite production build in GitHub Actions.

### Known limitations

The repository currently has no automated unit or end-to-end test suite, no Firebase Security Rules checked in, no application-owned backend, and no published release or deployment configuration. The application also sends third-party requests from the browser, so provider configuration and usage limits must be managed outside this repository.

### Potential next steps

Potential future work includes adding automated tests for the trip and expense flows, checking Firebase Security Rules into a versioned configuration, adding a formal deployment configuration, and providing a published demo URL. These are planning directions rather than implemented features.

### Changelog

No changelog file or tagged release history is currently present. Repository history is available on the [`main` branch](https://github.com/vincenzo-afk/TRIPPLANNER/commits/main).

---

## <a name="testing"></a>Testing

The repository does not currently define a `test` script or include a test framework. The available validation scripts are:

```bash
npm run lint
npm run build
```

The CI workflow runs `npm ci`, `npm run lint`, and `npm run build` for pushes to `main` and pull requests targeting `main`. A successful build produces the Vite output in `dist/`, which CI uploads as a short-lived artifact.

---

## <a name="deployment"></a>Deployment

This repository contains a client-side Vite build but no Dockerfile, hosting configuration, Firebase Hosting configuration, or Kubernetes manifests. Deploy it to a static host that can run the build and serve the generated `dist/` directory.

```bash
npm ci
npm run build
```

Set the required `VITE_` environment variables in the hosting provider before the build runs. Publish `dist/` as the site output. Because this is a single-page application, configure the host to fall back to `index.html` for client-side routes such as `/dashboard` and `/trip/:id`.

For a local production preview:

```bash
npm run preview
```

The repository does not currently define a deployment target or a public demo URL; deployment-specific settings must be added by the maintainer for the chosen hosting provider.

---

## <a name="contributing"></a>Contributing

Contributions are welcome when they are focused, reproducible, and consistent with the existing application. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) for the development setup, validation commands, branch guidance, pull-request expectations, and secret-handling rules.

Before submitting a pull request, run `npm run lint` and `npm run build`. Include screenshots for visual changes, document Firebase or Firestore changes, and never include API keys or private user data. Use the repository’s issue templates for bug reports and feature requests.

---

## <a name="security"></a>Security

Do not commit `.env` files, API keys, Firebase service-account credentials, or private user data. The `.gitignore` file excludes local environment files, and the application fails fast when required Firebase configuration is missing.

The `VITE_` prefix means values are included in the browser build. Treat these values as client-exposed configuration, restrict provider keys where the provider supports restrictions, and use Firebase Security Rules to control access to Firestore data. Report suspected vulnerabilities through the private process described in [`SECURITY.md`](SECURITY.md), not through a public issue.

---

## <a name="license"></a>License

No `LICENSE` file is currently present in this repository, and no open-source license is declared by the project. Unless the maintainer adds a license, repository contents remain under the applicable default copyright rules and should not be assumed to be freely reusable.

---

## <a name="acknowledgments"></a>Acknowledgments

TRIPPLANNER is built with React, Vite, Tailwind CSS, Firebase, Google Gemini, and Unsplash. The application’s visible project flows and current repository history were created by the project maintainer and prior contributors shown in Git history. See the [commit history](https://github.com/vincenzo-afk/TRIPPLANNER/commits/main) for the authoritative record.

---

## <a name="footer"></a>Footer

[Back to top](#tripplanner)

Built for the TRIPPLANNER repository by `vincenzo-afk`.

### References

[1]: https://react.dev/ "React documentation"
[2]: https://vite.dev/guide/ "Vite guide"
[3]: https://tailwindcss.com/docs/installation "Tailwind CSS documentation"
[4]: https://firebase.google.com/docs/web/setup "Firebase web setup"
[5]: https://ai.google.dev/gemini-api/docs "Gemini API documentation"
[6]: https://unsplash.com/documentation "Unsplash API documentation"
