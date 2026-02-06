import { Hono } from 'hono';
import { Env } from '../types';
import { sendTextMessage } from '../utils/whatsappClient';

const appointments = new Hono<{ Bindings: Env }>();

// List executive pre-registrations (appointments)
appointments.get('/', async (c) => {
  const status = c.req.query('status') || 'pending';

  const result = await c.env.DB.prepare(`
    SELECT pr.*, o.abbreviation as office_abbr, o.full_name as office_name, o.office_type
    FROM pre_registrations pr
    JOIN offices o ON pr.office_id = o.id
    WHERE o.office_type = 'executive' AND pr.status = ?
    ORDER BY pr.expected_date ASC, pr.expected_time ASC
  `).bind(status).all();

  return c.json({ appointments: result.results });
});

// Pending count (for dashboard badge)
appointments.get('/pending-count', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT COUNT(*) as count
    FROM pre_registrations pr
    JOIN offices o ON pr.office_id = o.id
    WHERE o.office_type = 'executive' AND pr.status = 'pending'
  `).first<any>();

  return c.json({ count: result?.count || 0 });
});

// Approve appointment
appointments.put('/:id/approve', async (c) => {
  const id = parseInt(c.req.param('id'));

  const preReg = await c.env.DB.prepare(`
    SELECT pr.*, o.abbreviation as office_abbr
    FROM pre_registrations pr
    JOIN offices o ON pr.office_id = o.id
    WHERE pr.id = ?
  `).bind(id).first<any>();

  if (!preReg) return c.json({ error: 'Appointment not found' }, 404);
  if (preReg.status !== 'pending') {
    return c.json({ error: `Cannot approve: appointment is already ${preReg.status}` }, 400);
  }

  // Generate QR token if not already set
  const qrToken = preReg.qr_token || crypto.randomUUID().split('-')[0];

  await c.env.DB.prepare(
    'UPDATE pre_registrations SET status = ?, qr_token = ?, confirmation_sent = TRUE WHERE id = ?'
  ).bind('confirmed', qrToken, id).run();

  // Send WhatsApp confirmation if phone exists
  if (preReg.whatsapp_phone) {
    try {
      await sendTextMessage(
        preReg.whatsapp_phone,
        `Your appointment has been *approved*!\n\n` +
        `*Office:* ${preReg.office_abbr}\n` +
        `*Date:* ${preReg.expected_date}\n` +
        `*Time:* ${preReg.expected_time || 'Not specified'}\n` +
        `*QR Code:* ${qrToken}\n\n` +
        `Please show this code at reception for quick check-in.\n\n` +
        `_Take a screenshot of this message for the reception desk._`,
        c.env
      );
    } catch (e) {
      console.error('Failed to send WhatsApp approval notification:', e);
    }
  }

  return c.json({
    appointment: { ...preReg, status: 'confirmed', qr_token: qrToken },
    message: 'Appointment approved',
  });
});

// Decline appointment
appointments.put('/:id/decline', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const reason = body.reason || 'No reason provided';

  const preReg = await c.env.DB.prepare(`
    SELECT pr.*, o.abbreviation as office_abbr
    FROM pre_registrations pr
    JOIN offices o ON pr.office_id = o.id
    WHERE pr.id = ?
  `).bind(id).first<any>();

  if (!preReg) return c.json({ error: 'Appointment not found' }, 404);
  if (preReg.status !== 'pending') {
    return c.json({ error: `Cannot decline: appointment is already ${preReg.status}` }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE pre_registrations SET status = ?, decline_reason = ? WHERE id = ?'
  ).bind('cancelled', reason, id).run();

  // Send WhatsApp decline notification if phone exists
  if (preReg.whatsapp_phone) {
    try {
      await sendTextMessage(
        preReg.whatsapp_phone,
        `We're sorry, your appointment request has been *declined*.\n\n` +
        `*Office:* ${preReg.office_abbr}\n` +
        `*Date:* ${preReg.expected_date}\n` +
        `*Reason:* ${reason}\n\n` +
        `You may submit a new request or contact reception for assistance.`,
        c.env
      );
    } catch (e) {
      console.error('Failed to send WhatsApp decline notification:', e);
    }
  }

  return c.json({
    appointment: { ...preReg, status: 'cancelled', decline_reason: reason },
    message: 'Appointment declined',
  });
});

export default appointments;
