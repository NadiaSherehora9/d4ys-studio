import { sendTelegramMessage } from "./src/lib/telegram.js";
// We have to mock import.meta.env for Node, but let's just write a pure fetch test.

const TELEGRAM_BOT_TOKEN = "8240813459:AAELCeXqoWMeREHhvq54h0vDTmT9ZFvyIWI";
const TELEGRAM_CHAT_ID = "-1003939671479";

const params = new URLSearchParams({
  chat_id: TELEGRAM_CHAT_ID,
  text: "<b>Test from Node</b>\nNew line",
  parse_mode: "HTML",
});

const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?${params.toString()}`;

fetch(url, { method: "GET" })
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
