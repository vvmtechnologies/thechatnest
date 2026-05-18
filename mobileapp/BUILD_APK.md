# Building TheChatNest APK

Everything is configured. Just run **one command** in your own terminal (PowerShell or Git Bash) inside `mobileapp/`:

## Quick build — preview APK (installable on any Android device)

```bash
cd b:/DEVELOPING/thechatnest/mobileapp
eas build --platform android --profile preview
```

That's it. The CLI will:

1. **Ask once**: "Generate a new Android Keystore?" — press **Y + Enter**.
   (EAS stores the keystore on their servers, so future builds reuse it automatically.)
2. Upload your project (~2–4 min).
3. Queue the build on EAS cloud (~10–15 min on free tier).
4. Print a URL when done — open it, click "Install" → APK downloads to your phone.

## What you'll get

- **APK file** (~80–120 MB unsigned, ~50–70 MB after Play install)
- **Direct install** on Android: enable "Unknown sources" → tap downloaded APK
- **Side-loadable**: share the APK link with testers
- **Hits production API** at `https://thechatnest-api.onrender.com`

## Build profiles available

| Profile | Output | Use for |
|---|---|---|
| `development` | dev-client APK | Debugging with Expo dev tools |
| **`preview`** | **Release APK** | **Internal testing / sharing** ← Use this |
| `production` | AAB | Play Store upload |

To build production AAB later:
```bash
eas build --platform android --profile production
```

## Check build status

```bash
eas build:list --platform android --limit 5
```

Or visit: https://expo.dev/accounts/thakurbhavesh1725/projects/thechatnest/builds

## Logged in as

`thakurbhavesh1725` ✓ (already authenticated on this machine)

## Project linked

- **Slug**: `thechatnest`
- **EAS Project ID**: `9641c7d5-bb92-47bc-a0bd-36583d1700e3`
- **Android package**: `com.thechatnest.app`
- **API**: `https://thechatnest-api.onrender.com` (set via `EXPO_PUBLIC_API_URL` in eas.json)

## If build fails

1. Check the build URL printed in the terminal — full logs are there
2. Common fixes:
   - **"Out of memory"** — Render free tier slow → retry
   - **"Plugin version mismatch"** — run `npx expo install --check`
   - **"Keystore prompt fails"** — run `eas credentials` first, choose Android → Set up a new Keystore
