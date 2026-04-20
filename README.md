# ✈️ Tripify — AI-Powered Travel Planner

Tripify is a full-stack React web application that helps users plan personalized trips using AI-generated destination suggestions, real destination photos, and a built-in expense tracker — all backed by Firebase.

---

## 🚀 Features

- 🔐 **Email/Password Authentication** — Firebase Auth with protected routes
- 🏠 **My Trips Dashboard** — view all saved trips with destination photos
- 🗑️ **Delete Trips (CRUD)** — delete trips (and their expenses) from the dashboard
- 🤖 **AI Destination Suggestions** — powered by Google Gemini API
- 🖼️ **Real Destination Photos** — fetched from Unsplash API
- 📅 **Day-by-Day Itinerary** — AI-generated, auto-saved to Firestore
- 💸 **Expense Tracker** — add, categorize, and track expenses per trip with a budget limit
- 🧾 **Delete Expenses** — remove expense entries from a trip
- 📱 **Fully Responsive UI** — built with Tailwind CSS
- ⚡ **Lazy-loaded Pages** — React.lazy + Suspense for performance

---

## 🛠️ Tech Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Frontend     | React 19 + Vite 8             |
| Styling      | Tailwind CSS v3               |
| Routing      | React Router DOM v7           |
| Auth + DB    | Firebase v12 (Auth + Firestore) |
| AI Engine    | Google Gemini API (`@google/generative-ai`) |
| Photos       | Unsplash REST API             |
| State Mgmt   | React Context API             |

---

## 📁 Project Structure

```
tripify/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── TripCard.jsx          # Reusable destination/trip card UI
│   │   ├── SkeletonCard.jsx      # Loading skeleton for cards
│   │   └── ExpenseItem.jsx       # Reusable expense row
│   ├── context/
│   │   ├── AuthProvider.jsx      # Global auth state provider (Context API)
│   │   └── authContext.js        # Context object
│   ├── hooks/
│   │   ├── useAuth.js            # Read auth context
│   │   └── useTrips.js           # Custom hook for fetching user trips
│   ├── pages/
│   │   ├── LoginPage.jsx         # Sign in / Sign up
│   │   ├── HomePage.jsx          # Trip preference form + background slider
│   │   ├── SuggestionsPage.jsx   # AI-generated destination cards
│   │   ├── TripPage.jsx          # Day-by-day itinerary view
│   │   ├── ExpensePage.jsx       # Expense tracker per trip
│   │   └── DashboardPage.jsx     # All saved trips
│   ├── services/
│   │   ├── firebase.js           # Firebase init (Auth + Firestore)
│   │   ├── ai.js                 # Gemini API calls
│   │   ├── trips.js              # Trip helpers (delete trip + expenses)
│   │   └── unsplash.js           # Unsplash API calls
│   ├── App.jsx                   # Routes + lazy loading + protected routes
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind directives
├── .env                          # API keys (never commit)
├── .gitignore
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file at the project root with the following keys:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-1.5-flash-001
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

> ⚠️ Never push `.env` to GitHub. It is already in `.gitignore`.

---

## 🔧 Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/tripify.git
cd tripify

# 2. Install dependencies
npm install

# 3. Add your .env file (see section above)

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 API Keys Setup

### Firebase (Auth + Firestore)
1. Go to [firebase.google.com](https://firebase.google.com)
2. Create a project → Add a Web App → Copy the `firebaseConfig` object
3. Enable **Authentication** → Email/Password provider
4. Enable **Firestore Database** → Start in test mode

### Google Gemini AI
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → Create new key → Copy

### Unsplash Photos
1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Register a new application → Copy the **Access Key**

---

## 📄 Page Breakdown

| Page            | Route            | Description                                         |
|-----------------|------------------|-----------------------------------------------------|
| Login           | `/login`         | Sign up or sign in with email and password          |
| Home            | `/home`          | Trip preference form with animated background slider |
| Suggestions     | `/suggestions`   | 3 AI-generated destination cards with photos        |
| Trip Detail     | `/trip/:id`      | Full day-by-day itinerary, auto-generated by Gemini |
| Expense Tracker | `/expenses/:id`  | Add and track expenses per trip with budget limit   |
| Dashboard       | `/dashboard`     | All saved trips for the logged-in user              |

---

## 🧠 How the AI Works

1. User selects **trip type** (Beach, Mountains, City), **budget level**, and **duration** on the Home page
2. Preferences are sent as a structured prompt to **Google Gemini**
3. Gemini returns exactly 3 destination suggestions as a JSON array
4. **Unsplash API** fetches a landscape photo for each destination
5. User selects a destination → trip is saved to Firestore
6. On the Trip page, Gemini generates a full day-by-day itinerary (also saved to Firestore so it's not regenerated on revisit)

---

## 🗄️ Firestore Data Model

```
trips/ (collection)
  └── {tripId}/ (document)
        ├── userId
        ├── destinationName
        ├── destinationCountry
        ├── destinationImage
        ├── budget ("Budget" | "Moderate" | "Luxury")
        ├── numericBudget (number)
        ├── tripType
        ├── duration
        ├── itinerary (array, generated on first view)
        └── createdAt

      expenses/ (sub-collection)
        └── {expenseId}/
              ├── amount
              ├── category
              ├── description
              ├── day
              └── createdAt
```

---

## ⚛️ React Concepts Demonstrated

| Concept                  | Where Used                                      |
|--------------------------|-------------------------------------------------|
| `useState`               | All pages — form state, loading, data           |
| `useEffect`              | Data fetching in SuggestionsPage, TripPage, etc.|
| `useContext`             | `useAuth()` across all protected pages          |
| `useMemo`                | Derived values (HomePage active trip, sorting)  |
| `useCallback`            | Stable handlers (HomePage, SuggestionsPage, DashboardPage) |
| `useRef`                 | Input focus (LoginPage email)                   |
| Context API              | `src/context/AuthProvider.jsx` — global auth state |
| Controlled Components    | All form inputs (budget, duration, expenses)    |
| Conditional Rendering    | Loading states, error states, empty states      |
| Protected Routes         | `ProtectedRoute` component in `App.jsx`         |
| React Router v7          | 6 routes with lazy loading                      |
| `React.lazy` + `Suspense`| All page components lazily loaded in `App.jsx`  |
| Lifting State Up         | Preferences passed via `location.state`         |

---

## 🚦 Build & Deployment

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview

# Deploy to Vercel (recommended)
npx vercel

# Or deploy to Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting   # set dist/ as public directory
firebase deploy
```

---

## 🧑‍💻 Author

**Tharun V**

---

## 📜 License

MIT License — free to use and modify.
