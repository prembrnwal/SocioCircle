# Quick Fix for Blank Page Issue

## Steps to Debug:

1. **Open Browser Console (F12)**
   - Go to the Console tab
   - Look for any red error messages
   - Copy the exact error message

2. **Check Terminal Output**
   - Look at the terminal where you ran `npm run dev`
   - Check for any compilation errors

3. **Common Issues & Fixes:**

### Issue 1: Module Not Found
**Error:** `Cannot find module './components/common'`
**Fix:** The index.ts file should exist at `src/components/common/index.ts`

### Issue 2: Zustand Persist Error
**Error:** `persist is not a function`
**Fix:** Make sure Zustand v5 is installed:
```bash
npm install zustand@^5.0.1
```

### Issue 3: React Query Error
**Error:** `useInfiniteQuery is not a function`
**Fix:** Make sure React Query v5 is installed:
```bash
npm install @tanstack/react-query@^5.56.2
```

### Issue 4: Import Error
**Error:** `Failed to resolve import`
**Fix:** Clear cache and reinstall:
```bash
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

## Test if Basic App Works:

Try accessing these URLs directly:
- `http://localhost:5173/login` - Should show login page
- `http://localhost:5173/register` - Should show register page

If these don't work, there's a fundamental issue with the app setup.

## Manual Test:

1. Stop the dev server (Ctrl+C)
2. Delete `.vite` folder if it exists
3. Run `npm run dev` again
4. Check both terminal and browser console for errors

## If Still Blank:

The ErrorBoundary should catch errors. If you see "Something went wrong", that means:
- The app is running
- But there's a JavaScript error
- Check the browser console for the actual error

Share the exact error message from the browser console for more specific help!
