# 🌌 Evana — AI-Powered Life Coach & Wellness Companion

Evana is a premium, state-of-the-art mobile application designed to act as your autonomous AI Life Coach and Wellness Tracker. Combining empathetic conversational intelligence with structured goal setting, habit tracking, and reflection logs, Evana empowers you to streamline your self-improvement journey.

---

## 🚀 Key Features

*   **💬 Conversational AI Life Coach:** Deeply engaging chat interface using Llama 3.3 70B (via Groq Cloud) for real-time guidance, tailored advice, and psychological framework applications. Features **WhatsApp-style layout logic** and **Android-stabilized auto-scroll**.
*   **🎯 Goal Tracking & Check-ins:** Structured goal-setting dashboard with custom progress intervals (Check-in +10%) and dynamic percentage tracking.
*   **🔔 Dynamic Milestone Notifications:** Real-time push alerts powered by Expo Push Notifications that celebrate achievements whenever you reach critical milestones (25%, 50%, 75%, 100%).
*   **📊 Consistency Analytics Dashboard:** Beautiful week-and-month consistency visualizations showing habit streaks, emotional baseline trends, mood scores, and weekly growth narratives.
*   **📝 Mood Reflection Journal:** Seamless journaling with real-time AI sentiment analysis mapping emotional states and tracking overall baseline consistency.
*   **🎙️ Voice Interface:** Hands-free voice-to-text AI coaching interface.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React Native, Expo, Redux Toolkit, Lucide Icons, Expo Linear Gradient, React Native Safe Area Context |
| **Backend** | FastAPI (Python), Supabase (Database & Auth), Groq API (Llama 3.3 70B), Pydantic validation |
| **Package Managers** | `npm` (Frontend), `uv` (Backend - Python package runner) |

---

## 📂 Project Architecture

```
Evana-AI-Life-Coach-App/
├── evana-app/              # Mobile App Codebase (React Native / Expo)
│   ├── src/
│   │   ├── components/     # UI components (ScreenWrapper, Button, ProgressRing, etc.)
│   │   ├── constants/      # App design tokens, themes, and API Endpoints
│   │   ├── screens/        # Main & Onboarding Chat, Goals Dashboard, Analytics, Profile
│   │   └── store/          # Redux State Management (Reducers, Actions, Slices)
│   └── package.json
└── backend/                # Server Codebase (FastAPI / python)
    ├── app/
    │   ├── api/            # API Router endpoints (Goals, Habits, Analytics, AI Coach)
    │   ├── core/           # Supabase DB Admin initialization & Security
    │   ├── schemas/        # Pydantic validation models
    │   └── services/       # Analytics calculations, Push notifications, Groq AI pipeline
    ├── main.py
    └── pyproject.toml
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python 3.12](https://www.python.org/downloads/)
*   [uv](https://github.com/astral-sh/uv) (Extremely fast Python package manager)

---

### 2. Backend Setup (`FastAPI`)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` directory with the following variables:
    ```env
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    GROQ_API_KEY=your_groq_cloud_api_key
    ```
3.  **Run the Server:**
    Utilizing the ultra-fast Python package installer `uv`, run the development server:
    ```bash
    uv run python main.py
    ```
    The API will spin up on `http://127.0.0.1:8000`.

---

### 3. Mobile Frontend Setup (`React Native / Expo`)

1.  **Navigate to the app directory:**
    ```bash
    cd ../evana-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API Config:**
    Open `src/constants/config.ts` and set your local machine's IP address so your physical/simulated device can connect to the local FastAPI backend.
4.  **Start the Expo Server:**
    ```bash
    npm start
    ```
5.  Scan the QR code in your terminal with your **Expo Go** application (on iOS or Android) to run the application on a real device.

---

## 🎨 Clean Layout & Fix Highlights

*   **WhatsApp Layout Integrity:** Removed absolute input floats to establish pure flex containment. Messages will never overlap with the input bar.
*   **Android Keyboard Deferral:** Added 120ms layout settlement timeouts to make chat auto-scrolling 100% reliable on all Android systems.
*   **Symmetric UI Alignment:** Fixed side small cards (Reflection & Goals) using strict `flex: 1` columns matching Left Card heights exactly for perfect pixel layout consistency on physical devices.
*   **Accurate Goals Analytics:** Replaced database column mismatches so goal progress percentages dynamically synchronize across Check-ins, database tables, and the Analytics dashboard.

---

## 📄 License
This project is proprietary. All rights reserved. Made with ❤️ by hamzaahmad3006.
