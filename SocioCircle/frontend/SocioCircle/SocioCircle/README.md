# SocioCircle - Community Platform for Musicians & Artists

A modern, Instagram-inspired community platform built with React, TypeScript, and Spring Boot.

## 🚀 Features

- **Authentication**: Secure login and registration with JWT tokens
- **Social Feed**: Infinite scroll feed with posts, likes, and comments
- **User Profiles**: Customizable profiles with bio, interests, and profile pictures
- **Interest Groups**: Join and create groups based on musical interests
- **Jamming Sessions**: Schedule and join live jamming sessions
- **Real-time Chat**: WebSocket-based chat for active sessions
- **Dark Mode**: Beautiful dark/light theme toggle
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## 🛠 Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with dark mode
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **WebSocket**: SockJS + STOMP.js
- **Form Validation**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Date Formatting**: date-fns
- **Notifications**: React Toastify

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure backend URL** (if different from default):
   - Edit `src/config/constants.ts`
   - Update `API_BASE_URL` and `WS_BASE_URL` if needed

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Backend URLs

Default configuration in `src/config/constants.ts`:
- API Base URL: `http://localhost:8080/api`
- WebSocket URL: `http://localhost:8080/ws-chat`

### Environment Variables

You can create a `.env` file to override these:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=http://localhost:8080/ws-chat
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Common UI components (Button, Input, Modal, etc.)
│   ├── layout/         # Layout components (Navbar, BottomNav, etc.)
│   └── posts/          # Post-related components
├── config/             # Configuration files
├── pages/              # Page components
├── services/           # API and WebSocket services
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 🎨 Design System

### Colors

**Light Mode:**
- Primary: `#0095F6` (Instagram blue)
- Background: `#FFFFFF`
- Surface: `#FAFAFA`
- Text Primary: `#262626`
- Text Secondary: `#8E8E93`

**Dark Mode:**
- Primary: `#0095F6`
- Background: `#000000`
- Surface: `#121212`
- Text Primary: `#FFFFFF`
- Text Secondary: `#A8A8A8`

### Typography

- Font: System fonts (San Francisco, Roboto, Segoe UI)
- Headings: Bold, 18-24px
- Body: Regular, 14-16px
- Caption: Regular, 12px

## 🔐 Authentication

The app uses JWT tokens stored in localStorage. Tokens are automatically included in all API requests via Axios interceptors.

## 📱 Key Features Implementation

### Infinite Scroll
- Uses Intersection Observer API
- Cursor-based pagination
- Loading states and empty states

### Real-time Chat
- WebSocket connection with auto-reconnect
- Message history loading
- Real-time message updates

### Image Upload
- Multiple image support
- Image preview before upload
- Progress indicators

### Optimistic Updates
- Likes and follows update immediately
- Rollback on error

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure backend WebSocket server is running
- Check CORS settings on backend
- Verify JWT token is valid

### API Errors
- Check backend is running on correct port
- Verify API_BASE_URL in constants.ts
- Check browser console for detailed error messages

## 📝 Development Notes

- All API calls use React Query for caching and state management
- Protected routes require authentication
- Dark mode preference is persisted in localStorage
- Images are lazy-loaded for performance

## 🚧 Future Enhancements

- [ ] Search functionality
- [ ] Notifications system
- [ ] Story feature
- [ ] Direct messaging
- [ ] Video support
- [ ] Advanced filters

## 📄 License

This project is part of the SocioCircle platform.
