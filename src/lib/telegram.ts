export const sendTelegramMessage = async (message: string) => {
  try {
    // Відправляємо запит на наш власний серверний маршрут Vercel (щоб обійти блокування браузером та AdBlock)
    const response = await fetch('/api/telegram', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error("Failed to send message via API", await response.text());
    }
  } catch (error) {
    console.error("Telegram Local API Error:", error);
  }
};
