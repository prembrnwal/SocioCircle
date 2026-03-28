# Frontend Technical Documentation

## Overview
This document provides a highly detailed architectural and technical overview of the SocioCircle frontend, a Community Group Chat and Session Management platform. Built using React, TypeScript, and Vite, the frontend is designed to be a high-performance, industry-level application with a professional, Instagram-like engaging UI/UX.

## 1. Frontend Architecture Explanation
The application follows a modern component-driven React architecture.
- **Framework & Build Tool:** React 18+ with Vite for fast HMR and optimized production builds.
- **Language:** TypeScript for static typing, enhancing code quality and developer experience.
- **Styling:** Tailwind CSS combined with Framer Motion for highly responsive, utility-based classes and smooth, engaging micro-interactions.
- **Data Fetching & Caching:** React Query (TanStack Query) handles efficient server-state management, caching, and background synchronization, ensuring an Instagram-like snappy feel.
- **Client-Side Routing:** React Router DOM (v6) manages client-side navigation with protected routes and lazy loading.
- **Real-Time Communication:** Native WebSockets integrated into custom hooks/stores to handle bidirectional chat messages dynamically.

## 2. Component Responsibilities
The UI is built using atomic and composite patterns categorized as:
- **Pages (`src/pages/`)**: Top-level route components. They connect fetching logic, select global state, and compose smaller components.
- **Layouts (`src/components/layout/`)**: Structural components like `Navbar`, `BottomNav`, and `ProtectedRoute` that define the visual shell and auth boundaries.
- **Common (`src/components/common/`)**: Highly reusable, stateless generic UI elements (`Button`, `Avatar`, `Input`, `Loading`, `Modal`). Designed to provide a cohesive design system.
- **Domain Components (`src/components/posts/`, etc.)**: Complex, feature-specific components like `PostCard` or `ChatMessage` that encapsulate their own UI and local state logic.

## 3. Page Workflows
- **Onboarding Workflow**: `Login` / `Register` -> Validates user -> Exchanges token -> Redirects to `Feed`.
- **Feed & General Navigation**: `Feed` -> Endless scrolling list of posts -> Interactive engagement (likes/comments).
- **Group & Session Workflow**: `Groups` -> `GroupDetail` -> `Sessions` -> `SessionDetail`. Allows users to discover groups, see active jamming sessions, and join them.
- **Real-Time Chat Workflow**: `Chat` page -> Establishes WS connection -> Displays history -> Real-time updates as users exchange messages.
- **User Profile Workflow**: `Profile` -> Views user metrics (followers, following, posts) -> `ProfileEdit` to modify bio and avatar.

## 4. Routing Structure
Routes are configured in `App.tsx` using `BrowserRouter`.
- **Public Routes:** `/login`, `/register`.
- **Protected Routes (Wrapped in `<ProtectedRoute>`):** 
  - `/feed` (Home Feed)
  - `/profile/:email?`, `/profile/edit` (User Profiles)
  - `/post/create`, `/post/:postId` (Post Management)
  - `/groups`, `/groups/:groupId` (Community Groups)
  - `/sessions`, `/sessions/:sessionId` (Active Jamming Sessions)
  - `/chat/:sessionId` (Real-time Messaging)
- **Lazy Loading:** `React.lazy` and `Suspense` are used to chunk route bundles, drastically reducing initial load times. A central Error Boundary manages rendering failures.

## 5. API Communication Flow
- **Axios Instance**: A centralized Axios client (`api.ts`) manages the `API_BASE_URL`.
- **Interceptors**: 
  - *Request*: Automatically attaches the JWT bearer token from `localStorage`.
  - *Response*: Catches globally `401 Unauthorized` responses, clears storage, and redirects the user to `/login`.
- **Querying**: React Query fetches the API wrappers and caches the response. Infinite scrolling uses `useInfiniteQuery`.

## 6. State Management Design
We use a hybrid state management model:
- **Server State**: Managed tightly by React Query (`useQuery`, `useMutation`). Eliminates complex `useEffect` data-fetching boilerplate.
- **Global App State**: Zustand (`authStore`, `themeStore`, `chatStore`). Lightweight, boiler-plate-free global state for things like current authenticated user, dark mode toggle, and active WebSocket messages.
- **Local State**: Managed by standard `useState` and `useReducer` for specific component states (modal visibility, form inputs).

## 7. Authentication Workflow
1. User submits credentials to `/login`.
2. Backend validates strings and issues a JWT.
3. `apiService.login` receives the token, stores it safely in `localStorage`.
4. Zustand's `authStore` sets `isAuthenticated=true` and saves user metadata.
5. React Router's `ProtectedRoute` verifies auth presence. If valid, renders children. If missing, forces navigation to `/login`.

## 8. WebSocket Communication Workflow
For real-time functionality in the `Chat` view:
1. `Chat.tsx` mounts and invokes `connectWebSocket(sessionId)`.
2. The `websocket.ts` service secures a native `WebSocket` connection utilizing the JWT for auth context.
3. Message reception triggers `chatStore.addMessage()`, immediately appending to the active message list.
4. Auto-scrolling to the bottom ensures users see the latest update.
5. On component unmount, the socket closes cleanly to prevent memory leaks.

## 9. Error Handling Strategy
- **Global Error Boundaries**: Catches React component tree rendering crashes and displays a custom fallback UI instead of breaking the app.
- **API Errors**: `react-toastify` acts as the notification mechanism, giving non-intrusive feedback (e.g., "Failed to load posts", "Invalid credentials").
- **Form Errors**: Native validation and responsive visual feedback (red borders, helper texts) inform users of mistakes before API submission.

## 10. User Interaction Flow
- Optimized for instant gratification using optimistic updates (e.g., clicking "Like" immediately updates the local count and heart color while the API request processes in the background).
- Navigation is immediate, with lazy-loaded skeletons appearing exactly where future data will pop in.

## 11. UI/UX Behavior Description
- **Modern Instagram-like Look**: Edge-to-edge mobile app feel, sticky navigation headers, and persistent bottom tabs on smaller viewports.
- **Glassmorphism Element**: Transparency and background blurs (`backdrop-blur-xl`) applied to headers and sticky navs over dynamic content.
- **Gradients and Whitespace**: Using vibrant gradient accents over rich blacks (Dark mode) or crisp whites (Light mode). Content uses generous padding to prevent visual clutter.
- **Loading Constraints**: Skeletons mimic the final content shape ensuring smooth visual transitions.

## 12. Design Principles for Professional/Engaging UI
- **Consistency**: Centralized theme rules config (via Tailwind).
- **Feedback**: Every interaction provides immediate visual feedback: hover states, active scaling (`active:scale-95`), loading spinners.
- **Motion**: Framer Motion handles elements entering and exiting the viewport, making page transitions feel continuous rather than disjointed.

## 13. System Scalability and Performance Considerations
- **Pagination via Cursors**: Feed and Chat load data sequentially (Cursor logic) instead of large offsets, guaranteeing fast database queries as data scales.
- **Component Memoization**: Preventing unnecessary DOM repaints using standard React optimizations.
- **Code Splitting**: Using Vite's dynamic imports per route basis limits the initial JS bundle payload.
