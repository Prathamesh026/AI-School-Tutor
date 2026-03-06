import { webhookPayloadSchema } from "../../utils/validation";

export type ParsedWhatsAppMessage = {
  phone: string;
  text: string;
  messageId: string;
};

export function parseIncomingMessage(payload: unknown): ParsedWhatsAppMessage[] {
  const parsed = webhookPayloadSchema.safeParse(payload);
  if (!parsed.success) return [];

  const out: ParsedWhatsAppMessage[] = [];
  for (const entry of parsed.data.entry) {
    for (const change of entry.changes) {
      for (const msg of change.value.messages ?? []) {
        if (msg.type !== "text" || !msg.text?.body) continue;
        out.push({ phone: msg.from, text: msg.text.body, messageId: msg.id });
      }
    }
  }
  return out;
}
