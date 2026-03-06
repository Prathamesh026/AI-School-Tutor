import axios from "axios";
import { config } from "../../config/config";

export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  await axios.post(
    `https://graph.facebook.com/v18.0/${config.PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: phone,
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}
