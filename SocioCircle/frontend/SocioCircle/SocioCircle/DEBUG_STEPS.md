# Debug Steps for Blank Page

## Step 1: Test if React Works

Temporarily replace the content of `src/App.tsx` with the content from `src/App.simple.tsx`:

1. Open `src/App.tsx`
2. Copy all content from `src/App.simple.tsx`
3. Paste it into `src/App.tsx` (replacing everything)
4. Save and refresh browser
5. You should see "SocioCircle - Test Page"

**If you see the test page:**
- React is working ✅
- The issue is in the full App component
- Proceed to Step 2

**If you still see blank:**
- There's a fundamental setup issue
- Check browser console (F12) for errors
- Check terminal for build errors

## Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for RED error messages
4. Copy the EXACT error message

Common errors you might see:

### Error: "Cannot find module"
- **Fix:** Run `npm install` again

### Error: "persist is not a function"
- **Fix:** Zustand version issue - run `npm install zustand@^5.0.1`

### Error: "useInfiniteQuery is not a function"
- **Fix:** React Query version - run `npm install @tanstack/react-query@^5.56.2`

### Error: "Failed to resolve import"
- **Fix:** Check if file exists at that path
- Check import paths are correct

## Step 3: Check Terminal Output

Look at the terminal where you ran `npm run dev`:

- Are there any compilation errors?
- Are there any warnings?
- Does it say "Local: http://localhost:5173"?

## Step 4: Verify Dependencies

Run this to check if all dependencies are installed:

```bash
npm list --depth=0
```

Should show all packages without errors.

## Step 5: Clear Everything and Reinstall

If nothing works:

```bash
# Stop the dev server (Ctrl+C)

# Delete everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Recurse -Force .vite

# Reinstall
npm install

# Start again
npm run dev
```

## Step 6: Check File Structure

Make sure these files exist:
- ✅ `src/main.tsx`
- ✅ `src/App.tsx`
- ✅ `src/index.css`
- ✅ `src/components/common/index.ts`
- ✅ `tailwind.config.js`
- ✅ `postcss.config.js`
- ✅ `vite.config.ts`

## What to Share for Help

If still not working, share:
1. **Browser console error** (F12 → Console tab)
2. **Terminal output** (from `npm run dev`)
3. **Screenshot** of the blank page
4. **Node version** (`node --version`)
5. **npm version** (`npm --version`)
