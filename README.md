<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yB5itmUE-9F6A-z2welldR1hCDwv6jXM

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and set:
   - `GEMINI_API_KEY` (get one from https://aistudio.google.com/app/apikey)
   - `VITE_SUPABASE_URL` (from your Supabase project settings)
   - `VITE_SUPABASE_ANON_KEY` (from your Supabase project settings)

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add the following environment variables in your Vercel project settings:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!
