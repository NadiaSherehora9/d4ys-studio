const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const sendTelegramMessage = async (message: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials missing");
    return;
  }

  try {
    const params = new URLSearchParams({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?${params.toString()}`;
    
    // GET запит з no-cors гарантовано уникає блокування браузером
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
    });
  } catch (error) {
    console.error("Telegram API Error:", error);
  }
};
