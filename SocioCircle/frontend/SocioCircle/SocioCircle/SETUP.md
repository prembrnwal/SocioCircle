# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd SocioCircle
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Ensure Backend is Running**
   - Backend should be running on `http://localhost:8080`
   - API Base URL: `http://localhost:8080/api`
   - WebSocket URL: `http://localhost:8080/ws-chat`

## Project Structure

```
SocioCircle/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Button, Input, Modal, Avatar, Loading
│   │   ├── layout/       # Navbar, BottomNav, ProtectedRoute
│   │   └── posts/        # PostCard component
│   ├── config/           # Constants and configuration
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Feed.tsx
│   │   ├── Profile.tsx
│   │   ├── ProfileEdit.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostCreate.tsx
│   │   ├── Groups.tsx
│   │   ├── GroupDetail.tsx
│   │   ├── Sessions.tsx
│   │   ├── SessionDetail.tsx
│   │   └── Chat.tsx
│   ├── services/         # API and WebSocket services
│   │   ├── api.ts        # Axios API client
│   │   └── websocket.ts  # WebSocket client
│   ├── stores/           # Zustand stores
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   └── chatStore.ts
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main app with routing
│   └── main.tsx          # Entry point
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies
```

## Key Features Implemented

✅ **Authentication**
- Login and Register pages
- JWT token management
- Protected routes
- Auto-logout on 401 errors

✅ **Social Feed**
- Infinite scroll with cursor pagination
- All posts and Following feed tabs
- Post cards with like/comment functionality
- Double-tap to like
- Image carousel for multiple images

✅ **User Profiles**
- Profile page with posts grid
- Edit profile page
- Profile picture upload
- Follow/unfollow functionality
- Followers/following stats

✅ **Posts**
- Create post with multiple images
- Post detail page with comments
- Like and comment functionality
- Post editing and deletion

✅ **Groups & Sessions**
- Groups list and detail pages
- Create and join groups
- Sessions list and detail
- Join/leave sessions

✅ **Real-time Chat**
- WebSocket integration
- Real-time message sending/receiving
- Message history loading
- Auto-scroll to bottom

✅ **UI/UX**
- Dark mode toggle
- Responsive design (mobile-first)
- Smooth animations with Framer Motion
- Loading states and skeletons
- Toast notifications
- Instagram-inspired design

## Important Notes

1. **Zustand Persist**: The persist middleware is imported from `zustand/middleware`. If you encounter issues, ensure Zustand v5 is installed.

2. **WebSocket**: The chat uses SockJS + STOMP.js. Make sure your backend WebSocket endpoint is configured correctly.

3. **API Base URL**: Update `src/config/constants.ts` if your backend runs on a different port.

4. **CORS**: Ensure your backend allows CORS requests from `http://localhost:5173` (Vite default port).

## Troubleshooting

### WebSocket Connection Issues
- Check backend WebSocket server is running
- Verify JWT token is valid
- Check browser console for connection errors

### API Errors
- Verify backend is running on port 8080
- Check API_BASE_URL in constants.ts
- Ensure JWT token is being sent in headers

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if needed
- Check TypeScript version compatibility

## Next Steps

1. Test all features with your backend
2. Customize colors and styling as needed
3. Add additional features (search, notifications, etc.)
4. Optimize images and add lazy loading
5. Add error boundaries for better error handling
