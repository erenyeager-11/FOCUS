// Vercel serverless function — runs on Vercel's server, never in the browser.
// The API key is read from an Environment Variable set in the Vercel dashboard
// (Project -> Settings -> Environment Variables -> GEMINI_API_KEY), so it never
// appears in any file, git repo, or page source.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const question = req.body && req.body.question;
  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Missing question' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY — add it in Vercel Project Settings -> Environment Variables, then redeploy.' });
    return;
  }

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "You are a friendly, clear study tutor inside a student's focus app. Explain the doubt simply and step by step, in well-organized short paragraphs or numbered steps. If it involves math, show the working."
            }]
          },
          contents: [{ role: 'user', parts: [{ text: question }] }]
        })
      }
    );

    const data = await geminiRes.json();

    if (data.error) {
      res.status(502).json({ error: data.error.message || 'Gemini API returned an error' });
      return;
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach Gemini API' });
  }
};
