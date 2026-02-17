# 🔥 Firebase Setup Guide for Flash Pizza (100% FREE)

## Why Firebase?
- ✅ **Completely FREE** for small businesses
- ✅ **No credit card required**
- ✅ **Real-time sync** across all devices
- ✅ **Works worldwide**
- ✅ **Easy setup** (15 minutes)

---

## Step 1: Create Firebase Account

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Sign in with your **Google account**
3. Click **"Create a project"**

---

## Step 2: Create Project

1. **Project name**: `flash-pizza` (or your restaurant name)
2. **Google Analytics**: Click "Continue" (optional, can disable)
3. Click **"Create project"**
4. Wait for setup... Click **"Continue"**

---

## Step 3: Create Realtime Database

1. In left sidebar, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose location: **Singapore** (for India) or closest to you
4. Select **"Start in test mode"** (we'll secure later)
5. Click **"Enable"**

---

## Step 4: Get Your Credentials

1. Click the **⚙️ gear icon** (top left) → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **web icon** `</>`
4. **App nickname**: `flash-pizza-web`
5. ❌ Don't check "Firebase Hosting" (optional for later)
6. Click **"Register app"**
7. You'll see code like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "flash-pizza-xxxxx.firebaseapp.com",
  projectId: "flash-pizza-xxxxx",
  storageBucket: "flash-pizza-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  databaseURL: "https://flash-pizza-xxxxx-default-rtdb.firebaseio.com"
};
```

8. **COPY these values!**

---

## Step 5: Create .env File

Create a file named `.env` in your project root folder:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=flash-pizza-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=flash-pizza-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=flash-pizza-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_DATABASE_URL=https://flash-pizza-xxxxx-default-rtdb.firebaseio.com
```

**Replace the values with YOUR Firebase credentials!**

---

## Step 6: Secure Your Database (IMPORTANT!)

1. Go to **Realtime Database** → **"Rules"** tab
2. Replace the rules with:

```json
{
  "rules": {
    "menuItems": {
      ".read": true,
      ".write": "auth != null"
    },
    "coupons": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      ".read": true,
      ".write": true
    },
    "storeConfig": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

For now (testing), use these simple rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. Click **"Publish"**

---

## Step 7: Rebuild Your App

```bash
npm run build
```

---

## Step 8: Verify Connection

1. Open your app
2. Go to Admin Panel (`?admin`)
3. Look for **🔥 Firebase Connected** badge
4. If you see **💾 Local Storage**, check your `.env` file

---

## Free Tier Limits (More than enough!)

| Resource | Free Limit | Your Usage (est.) |
|----------|------------|-------------------|
| Storage | 1 GB | ~5 MB |
| Downloads | 10 GB/month | ~500 MB |
| Connections | 100 simultaneous | ~10-20 |
| Reads/Writes | Unlimited | ✅ |

**For a small pizza shop with 50-100 orders/day, you'll NEVER exceed free limits!**

---

## Troubleshooting

### "Firebase not connecting"
- Check `.env` file exists in project root
- Check all values are correct (no spaces)
- Restart dev server: `npm run dev`

### "Permission denied"
- Check database rules (Step 6)
- Make sure rules are set to allow read/write

### "Database URL missing"
- Go to Realtime Database in Firebase Console
- Copy the URL from the top (looks like `https://xxx.firebaseio.com`)
- Add it to `.env` as `VITE_FIREBASE_DATABASE_URL`

---

## Hosting (Optional - Also FREE!)

To host your app for free:

### Option 1: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 2: Vercel (Easy)
1. Push code to GitHub
2. Go to vercel.com
3. Import your repo
4. Add environment variables
5. Deploy!

### Option 3: Netlify
1. Push code to GitHub
2. Go to netlify.com
3. Import your repo
4. Add environment variables
5. Deploy!

---

## Need Help?

If you face any issues:
1. Check Firebase Console for errors
2. Check browser console (F12)
3. Verify `.env` values are correct

Your app will work with localStorage until Firebase is configured!
