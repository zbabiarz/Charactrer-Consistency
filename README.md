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

2. Set up your Gemini API key:
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Open the `.env` file
   - Replace `your_api_key_here` with your actual API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

   **In Bolt.new:** You can also add the API key via Settings → Secrets → Add `GEMINI_API_KEY`

3. Run the app:
   ```bash
   npm run dev
   ```

## Features

- **Character Upload**: Upload multiple character images with individual art style preferences
- **AI Background Generation**: Generate custom backgrounds using Gemini AI
- **Smart Composition**: Place characters in scenes with visual layout guides
- **AI Image Generation**: Merge characters into backgrounds with style preservation
- **Upscaling**: Enhance final images to 2K resolution
- **Database Storage**: Save and manage projects using Supabase

## Environment Variables

Required environment variables in `.env`:

- `GEMINI_API_KEY` - Your Gemini API key from Google AI Studio
- `VITE_SUPABASE_URL` - Supabase project URL (pre-configured)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (pre-configured)
