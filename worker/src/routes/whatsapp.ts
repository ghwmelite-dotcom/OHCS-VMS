import { Hono } from 'hono';
import { Env } from '../types';
import { handleIncomingMessage } from '../utils/conversationManager';
import { logMessage } from '../utils/whatsappClient';

const whatsapp = new Hono<{ Bindings: Env }>();

// Webhook verification (Meta sends GET to verify endpoint)
whatsapp.get('/', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  if (mode === 'subscribe' && token === c.env.WHATSAPP_VERIFY_TOKEN) {
    return c.text(challenge || '', 200);
  }

  return c.text('Forbidden', 403);
});

// Receive incoming messages
whatsapp.post('/', async (c) => {
  const body = await c.req.json();

  // Return 200 immediately to acknowledge receipt
  const env = c.env;

  // Process asynchronously
  c.executionCtx.waitUntil(processWebhook(body, env));

  return c.text('OK', 200);
});

async function processWebhook(body: any, env: Env): Promise<void> {
  try {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.length) return;

    for (const message of value.messages) {
      const phone = message.from;
      let text: string | null = null;
      let interactive: any = null;

      switch (message.type) {
        case 'text':
          text = message.text?.body || null;
          break;
        case 'interactive':
          if (message.interactive?.type === 'button_reply') {
            interactive = {
              type: 'button_reply',
              button_reply: message.interactive.button_reply,
            };
          } else if (message.interactive?.type === 'list_reply') {
            interactive = {
              type: 'list_reply',
              list_reply: message.interactive.list_reply,
            };
          }
          break;
        default:
          // Unsupported message type — treat as text
          text = '[unsupported message type]';
      }

      // Log inbound message
      await logMessage(env, {
        direction: 'inbound',
        wa_phone: phone,
        wa_message_id: message.id,
        message_type: message.type,
        content: text || interactive?.button_reply?.title || interactive?.list_reply?.title || '',
      });

      await handleIncomingMessage(phone, text, interactive, env);
    }
  } catch (e) {
    console.error('WhatsApp webhook processing error:', e);
  }
}

export default whatsapp;
