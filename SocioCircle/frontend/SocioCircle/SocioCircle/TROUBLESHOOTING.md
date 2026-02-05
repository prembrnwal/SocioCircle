# Troubleshooting Guide

## App Not Running

### 1. Check Node.js Installation
First, verify Node.js is installed:
```bash
node --version
npm --version
```

If these commands don't work, install Node.js from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies
Make sure all dependencies are installed:
```bash
cd SocioCircle
npm install
```

### 3. Check for Errors
Try running the dev server and check for specific error messages:
```bash
npm run dev
```

Common errors and solutions:

#### Error: "Cannot find module"
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

#### Error: "Port already in use"
- Change the port in `vite.config.ts` or kill the process using port 5173

#### Error: "Module not found" or import errors
- Check that all files exist in the correct locations
- Verify import paths are correct
- Make sure `src/components/common/index.ts` exists

#### Error: "Zustand persist middleware"
- Ensure Zustand v5 is installed: `npm install zustand@^5.0.1`
- The persist middleware should be available in v5

#### TypeScript Errors
- Run `npm run build` to see TypeScript errors
- Check `tsconfig.json` configuration

### 4. Clear Cache
If issues persist, try clearing caches:
```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# On Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstall
npm install
```

### 5. Check Backend Connection
The app requires a backend running on `http://localhost:8080`
- Verify your Spring Boot backend is running
- Check CORS settings allow requests from `http://localhost:5173`

### 6. Browser Console Errors
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed API requests
- Application tab for localStorage issues

### 7. Common Issues

#### Dark Mode Not Working
- Check that `tailwind.config.js` has `darkMode: 'class'`
- Verify `document.documentElement.classList` is being toggled

#### WebSocket Connection Fails
- Ensure backend WebSocket server is running
- Check WebSocket URL in `src/config/constants.ts`
- Verify JWT token is valid

#### Routes Not Working
- Check React Router version matches (v6)
- Verify all route paths in `src/config/constants.ts`
- Check that `BrowserRouter` wraps the app

### 8. Verify File Structure
Ensure all these files exist:
```
SocioCircle/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── index.ts  ← Important!
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Feed.tsx
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### 9. Manual Testing Steps
1. Start backend: Ensure Spring Boot is running on port 8080
2. Start frontend: `npm run dev`
3. Open browser: Navigate to `http://localhost:5173`
4. Check console: Look for any errors
5. Test login: Try logging in with test credentials

### 10. Get Help
If issues persist:
1. Check the exact error message in terminal/browser console
2. Verify Node.js version (should be 16+)
3. Check npm version (should be 8+)
4. Share the specific error message for targeted help

## Quick Fixes

### Reset Everything
```bash
# Remove all dependencies and cache
rm -rf node_modules package-lock.json .vite

# Reinstall
npm install

# Start fresh
npm run dev
```

### Check TypeScript
```bash
# Check for TypeScript errors
npx tsc --noEmit
```

### Check Build
```bash
# Try building to see all errors
npm run build
```
