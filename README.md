<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create [.env.local](.env.local) with:
   - `GEMINI_API_KEY=<your-key>`
   - `VITE_API_URL=http://127.0.0.1:8080` (simulator) or `http://<LAN-IP>:8080` (real device)
3. Run the app:
   `npm run dev`

## API base URL

- Frontend reads `VITE_API_URL` (required for production) and optional `VITE_DEV_API_URL` from `config/env.ts`.
- Dev fallback is `http://127.0.0.1:8080` for simulators. Production builds must point to an HTTPS host; there is no localhost fallback in release builds.

## iOS (Capacitor) Setup

This project now ships with Capacitor config so you can run it as an iOS app.

1. Install tooling once: `npm install`
2. Build the web assets: `npm run build`
3. Add the iOS platform (one time): `npx cap add ios`
4. Sync web assets and native config: `npm run cap:sync`
5. For live reload during development (preferred):
   - Start Vite: `npm run dev -- --host --port 5173` (or `--host <LAN-IP>` when testing on device).
   - Run the app with live reload: `npx cap run ios -l --external --target "<simulator or device>"`
   - Simulator can use `VITE_API_URL=http://127.0.0.1:8080`; real devices should use `VITE_API_URL=http://<LAN-IP>:8080`.
6. Open in Xcode for signing/release: `npx cap open ios`
   - Release builds use `ios/App/App/Info.plist` (ATS-compliant, HTTPS only).
   - Debug/live-reload builds use `ios/App/App/Info-Debug.plist`, which allows cleartext HTTP only for development.
7. Production deployments must set `VITE_API_URL=https://<hosted-backend>` and serve over HTTPS to satisfy ATS.
