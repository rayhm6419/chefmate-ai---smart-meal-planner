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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## iOS (Capacitor) Setup

This project now ships with Capacitor config so you can run it as an iOS app.

1. Install tooling once: `npm install`
2. Build the web assets: `npm run build`
3. Add the iOS platform (one time): `npx cap add ios`
4. Sync web assets and native config: `npm run cap:sync`
5. Open in Xcode and run on a simulator/device: `npx cap open ios`
   - From Xcode, select a simulator and press Run. If you prefer the CLI, `npm run cap:ios -- --target "<simulator name or UDID>"`.
6. For live reload during development (optional):
   - Start Vite with a host IP the simulator can reach: `npm run dev -- --host --port 5173`
   - Update `server.url` in `capacitor.config.ts` to `http://<your-ip>:5173` and set `cleartext: true` temporarily, then re-run `npm run cap:sync`.
