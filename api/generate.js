// Vercel Serverless Function
// Save this as `api/generate.js` inside an 'api' folder in your project

export default async function handler(request, response) {
  // 1. We only allow POST requests for security
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { history, systemPrompt } = request.body;
    
    // 2. Your secret API key is retrieved securely from environment variables.
    //    It is NEVER exposed to the public.
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
      // This error will show in your Vercel logs if the key is missing
      console.error("API key is not configured.");
      throw new Error("API key is not configured.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // 3. Construct the payload with the user's message and the system instructions
    const payload = {
      contents: history,
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    };
    
    // 4. Securely call the Google AI from your backend server
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Handle errors from the Google AI API
    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API Error:", errorText);
        throw new Error(`Gemini API responded with status: ${geminiResponse.status}`);
    }
    
    const data = await geminiResponse.json();
    
    // 5. Send the AI's response back to your website's frontend
    response.status(200).json(data);

  } catch (error) {
    // This will catch any errors in the process and send a clean error message back.
    console.error("Error in serverless function:", error);
    response.status(500).json({ message: "An internal error occurred." });
  }
}

