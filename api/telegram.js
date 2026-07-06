export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let token = process.env.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.VITE_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (token) {
    token = token.trim().replace(/['"<>\s]/g, '');
  }
  if (chatId) {
    chatId = chatId.trim().replace(/['"<>\s]/g, '');
  }

  if (!token || !chatId) {
    console.error("Missing Telegram credentials on server");
    return res.status(500).json({ error: 'Server configuration error. Credentials missing.' });
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Telegram API Error:", responseData);
      return res.status(500).json({ error: 'Telegram API failed', details: responseData });
    }

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
