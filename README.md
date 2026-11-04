# LegalPro - Frontend Dashboard (Next.js 14)

**LegalPro Frontend** is a modern, enterprise-grade, and highly responsive user interface built with **Next.js 14** and **TypeScript**. It seamlessly consumes the Laravel backend API to deliver a fast, intuitive, and feature-rich experience for lawyers, staff, and clients.

## 🌟 Key Frontend Features

### 📱 1. Mobile-First Responsive Design
- **Collapsible Sidebar:** Smooth, animated hamburger menu for mobile and tablet devices.
- **Responsive Data Tables:** Horizontal scrolling and card-view adaptations for small screens.
- **Touch-Friendly UI:** Optimized button sizes, full-screen modals, and accessible form inputs for mobile users.

### ⚡ 2. Premium UI/UX Polish
- **Loading Skeletons:** Replaces basic spinners with structural placeholders for a faster perceived load time.
- **Smooth Transitions:** Page and modal animations powered by `framer-motion`.
- **Beautiful Empty States:** Informative, illustrated fallback screens when no data is available.
- **Toast Notifications:** Instant, non-intrusive feedback for success, error, and warning states using `react-hot-toast`.

### ⚙️ 3. Dynamic Global State & Branding
- **Zustand State Management:** Lightweight, global state for Authentication (`useAuthStore`) and System Settings (`useSettingStore`).
- **Dynamic Branding:** Automatically fetches and displays the System Name and Logo from the backend on the Login Page and Sidebar without requiring authentication.

### 🔔 4. Real-Time Notification Center
- Interactive dropdown in the Header showing unread counts with a pulsing red badge.
- One-click "Mark all as read" functionality.
- Clicking a notification automatically marks it as read via API and navigates to the relevant page.

### 🔍 5. Advanced Global Search
- **Keyboard Shortcut:** Instantly open the search modal using `Cmd + K` (Mac) or `Ctrl + K` (Windows).
- Unified search across Cases, Clients, and Invoices with debounced API calls for optimal performance.

### 📄 6. Interactive Document & Template UI
- **Auto-Fill Preview:** Side-by-side modal allowing users to select a Client/Case and instantly preview the filled legal document before copying.
- **AI Summarizer UI:** Clean, structured display of AI-generated document summaries with loading states during processing.

### 🌓 7. Seamless Dark/Light Mode
- Persistent theme switching saved in `localStorage`.
- Carefully tuned Tailwind CSS `dark:` variants for perfect contrast and readability in both modes.

---

## 🛠️ Tech Stack & Packages

| Category | Technology / Package |
|----------|----------------------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand |
| **API Client** | Axios (with interceptors for auth tokens) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Notifications** | React Hot Toast |
| **Date Formatting** | date-fns / native JS Date |

---

## 📂 Architecture & Folder Structure

This frontend follows a clean, modular structure to ensure scalability and maintainability:

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, Loading states)
│   ├── (dashboard)/      # Protected routes (Cases, Tasks, Invoices, etc.)
│   └── login/            # Public authentication route
├── components/           # Reusable UI components
│   ├── layout/           # Sidebar, Header, MainLayout
│   └── ui/               # Skeletons, EmptyStates, Buttons, Inputs
├── services/             # Axios API service functions (e.g., caseService, settingService)
├── store/                # Zustand global state stores (authStore, settingStore)
├── types/                # Centralized TypeScript interfaces and types
└── lib/                  # Utility functions and Axios instance configuration