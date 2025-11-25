export const getGeminiApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error(
      'Gemini API key not configured.\n\n' +
      'Please follow these steps:\n' +
      '1. Get your API key from https://aistudio.google.com/app/apikey\n' +
      '2. Add it to your .env file as VITE_GEMINI_API_KEY=your_actual_key\n' +
      '3. Restart the development server\n\n' +
      'Note: In Bolt, you can also add it via the Secrets section in settings.'
    );
  }

  return apiKey;
};
