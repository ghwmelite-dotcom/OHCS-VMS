import { Env } from '../types';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

interface Button {
  id: string;
  title: string;
}

interface ListSection {
  title: string;
  rows: { id: string; title: string; description?: string }[];
}

interface MessageLogData {
  direction: 'inbound' | 'outbound';
  wa_phone: string;
  wa_message_id?: string;
  message_type?: string;
  content?: string;
  pre_registration_id?: number;
  status?: string;
  error?: string;
}

async function sendRequest(env: Env, body: any): Promise<any> {
  const res = await fetch(`${GRAPH_API}/${env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendTextMessage(phone: string, text: string, env: Env): Promise<void> {
  const result = await sendRequest(env, {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body: text },
  });

  await logMessage(env, {
    direction: 'outbound',
    wa_phone: phone,
    wa_message_id: result?.messages?.[0]?.id,
    message_type: 'text',
    content: text,
    status: result?.messages ? 'sent' : 'failed',
    error: result?.error?.message,
  });
}

export async function sendButtonMessage(
  phone: string,
  bodyText: string,
  buttons: Button[],
  env: Env
): Promise<void> {
  const result = await sendRequest(env, {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map(b => ({
          type: 'reply',
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });

  await logMessage(env, {
    direction: 'outbound',
    wa_phone: phone,
    wa_message_id: result?.messages?.[0]?.id,
    message_type: 'interactive_button',
    content: bodyText,
    status: result?.messages ? 'sent' : 'failed',
    error: result?.error?.message,
  });
}

export async function sendListMessage(
  phone: string,
  bodyText: string,
  buttonLabel: string,
  sections: ListSection[],
  env: Env
): Promise<void> {
  const result = await sendRequest(env, {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonLabel,
        sections,
      },
    },
  });

  await logMessage(env, {
    direction: 'outbound',
    wa_phone: phone,
    wa_message_id: result?.messages?.[0]?.id,
    message_type: 'interactive_list',
    content: bodyText,
    status: result?.messages ? 'sent' : 'failed',
    error: result?.error?.message,
  });
}

export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  parameters: string[],
  env: Env
): Promise<void> {
  const result = await sendRequest(env, {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: parameters.length > 0 ? [{
        type: 'body',
        parameters: parameters.map(p => ({ type: 'text', text: p })),
      }] : undefined,
    },
  });

  await logMessage(env, {
    direction: 'outbound',
    wa_phone: phone,
    wa_message_id: result?.messages?.[0]?.id,
    message_type: 'template',
    content: `template:${templateName}`,
    status: result?.messages ? 'sent' : 'failed',
    error: result?.error?.message,
  });
}

export async function logMessage(env: Env, data: MessageLogData): Promise<void> {
  try {
    await env.DB.prepare(`
      INSERT INTO wa_message_log (direction, wa_phone, wa_message_id, message_type, content, pre_registration_id, status, error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.direction,
      data.wa_phone,
      data.wa_message_id || null,
      data.message_type || null,
      data.content || null,
      data.pre_registration_id || null,
      data.status || 'sent',
      data.error || null,
    ).run();
  } catch (e) {
    console.error('Failed to log WhatsApp message:', e);
  }
}
