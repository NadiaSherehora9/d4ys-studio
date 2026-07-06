import https from 'https';

export default async function handler(req, res) {
  // Запобігаємо падінню, якщо req.body порожній
  const body = req.body || {};
  const message = body.message;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

  // Використовуємо нативний модуль https замісті fetch для 100% сумісності з будь-якою версією Node.js
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const reqTg = https.request(options, (resTg) => {
      let data = '';
      resTg.on('data', (chunk) => {
        data += chunk;
      });

      resTg.on('end', () => {
        if (resTg.statusCode >= 200 && resTg.statusCode < 300) {
          res.status(200).json({ success: true });
        } else {
          console.error("Telegram API Response Error:", data);
          res.status(500).json({ error: 'Telegram API failed', details: data });
        }
        resolve();
      });
    });

    reqTg.on('error', (e) => {
      console.error("HTTPS Request Error:", e);
      res.status(500).json({ error: 'Internal HTTPS Error', details: e.message });
      resolve();
    });

    reqTg.write(postData);
    reqTg.end();
  });
}
