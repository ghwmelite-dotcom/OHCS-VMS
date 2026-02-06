import { Env } from '../types';
import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  logMessage,
} from './whatsappClient';

// ── State machine types ──

type SessionState =
  | 'WELCOME'
  | 'ASK_NAME'
  | 'ASK_OFFICE'
  | 'ASK_PURPOSE'
  | 'ASK_ORG'
  | 'ASK_DATETIME'
  | 'CONFIRM';

interface SessionData {
  visitor_name?: string;
  office_id?: number;
  office_abbr?: string;
  office_type?: string;
  purpose?: string;
  organization?: string;
  expected_date?: string;
  expected_time?: string;
  host_officer?: string;
}

interface Session {
  state: SessionState;
  data: SessionData;
}

interface InteractivePayload {
  type: 'button_reply' | 'list_reply';
  button_reply?: { id: string; title: string };
  list_reply?: { id: string; title: string; description?: string };
}

const SESSION_TTL = 1800; // 30 minutes

const PURPOSES = [
  'Official Meeting',
  'Document Submission',
  'Document Collection',
  'Consultation',
  'Training/Workshop',
  'Courtesy Call',
  'Audit Review',
  'Complaint/Inquiry',
  'Interview',
  'Service Request',
  'Other',
];

// ── Main entry point ──

export async function handleIncomingMessage(
  phone: string,
  text: string | null,
  interactive: InteractivePayload | null,
  env: Env
): Promise<void> {
  const sessionKey = `wa-session:${phone}`;
  const raw = await env.KV.get(sessionKey);
  let session: Session | null = raw ? JSON.parse(raw) : null;

  // No session or explicit reset → send welcome
  if (!session) {
    await sendWelcomeMessage(phone, env);
    await saveSession(env, sessionKey, { state: 'WELCOME', data: {} });
    return;
  }

  const buttonId = interactive?.button_reply?.id;
  const listId = interactive?.list_reply?.id;

  switch (session.state) {
    case 'WELCOME':
      await handleWelcome(phone, buttonId, text, session, sessionKey, env);
      break;
    case 'ASK_NAME':
      await handleAskName(phone, text, session, sessionKey, env);
      break;
    case 'ASK_OFFICE':
      await handleAskOffice(phone, listId, session, sessionKey, env);
      break;
    case 'ASK_PURPOSE':
      await handleAskPurpose(phone, listId, session, sessionKey, env);
      break;
    case 'ASK_ORG':
      await handleAskOrg(phone, text, session, sessionKey, env);
      break;
    case 'ASK_DATETIME':
      await handleAskDateTime(phone, text, session, sessionKey, env);
      break;
    case 'CONFIRM':
      await handleConfirm(phone, buttonId, session, sessionKey, env);
      break;
    default:
      await clearSession(env, sessionKey);
      await sendWelcomeMessage(phone, env);
      await saveSession(env, sessionKey, { state: 'WELCOME', data: {} });
  }
}

// ── Welcome ──

async function sendWelcomeMessage(phone: string, env: Env): Promise<void> {
  await sendButtonMessage(
    phone,
    'Welcome to the *Office of the Head of Civil Service (OHCS)* Visitor Management System.\n\nHow can we help you today?',
    [
      { id: 'pre_register', title: 'Pre-register' },
      { id: 'check_status', title: 'Check Status' },
      { id: 'office_directory', title: 'Office Directory' },
    ],
    env
  );
}

async function handleWelcome(
  phone: string,
  buttonId: string | undefined,
  text: string | null,
  session: Session,
  sessionKey: string,
  env: Env
): Promise<void> {
  // Also accept text input matching button labels
  const normalizedText = text?.toLowerCase().trim();
  const effectiveId = buttonId
    || (normalizedText?.includes('register') ? 'pre_register' : null)
    || (normalizedText?.includes('status') ? 'check_status' : null)
    || (normalizedText?.includes('directory') || normalizedText?.includes('office') ? 'office_directory' : null);

  switch (effectiveId) {
    case 'pre_register':
      await sendTextMessage(phone, 'Great! Let\'s get you pre-registered.\n\nPlease type your *full name*:', env);
      await saveSession(env, sessionKey, { state: 'ASK_NAME', data: {} });
      break;
    case 'check_status':
      await handleStatusCheck(phone, env);
      await clearSession(env, sessionKey);
      break;
    case 'office_directory':
      await handleOfficeDirectory(phone, env);
      await clearSession(env, sessionKey);
      break;
    default:
      await sendWelcomeMessage(phone, env);
      break;
  }
}

// ── ASK_NAME ──

async function handleAskName(
  phone: string,
  text: string | null,
  session: Session,
  sessionKey: string,
  env: Env
): Promise<void> {
  if (!text || text.trim().length < 2) {
    await sendTextMessage(phone, 'Please enter a valid full name (at least 2 characters):', env);
    return;
  }

  session.data.visitor_name = text.trim();
  await sendOfficeListMessage(phone, env);
  await saveSession(env, sessionKey, { state: 'ASK_OFFICE', data: session.data });
}

// ── ASK_OFFICE ──

async function sendOfficeListMessage(phone: string, env: Env): Promise<void> {
  const offices = await env.DB.prepare(
    'SELECT id, abbreviation, full_name, office_type, floor, room FROM offices WHERE is_active = TRUE ORDER BY office_type, abbreviation'
  ).all();

  const executive = (offices.results as any[]).filter(o => o.office_type === 'executive');
  const directorates = (offices.results as any[]).filter(o => o.office_type === 'directorate');
  const units = (offices.results as any[]).filter(o => o.office_type === 'unit');

  const sections = [];
  if (executive.length > 0) {
    sections.push({
      title: 'Executive Offices',
      rows: executive.map(o => ({
        id: `office_${o.id}`,
        title: o.abbreviation,
        description: `${o.full_name} (${o.floor})`,
      })),
    });
  }
  if (directorates.length > 0) {
    sections.push({
      title: 'Directorates',
      rows: directorates.map(o => ({
        id: `office_${o.id}`,
        title: o.abbreviation,
        description: `${o.full_name} (${o.floor})`,
      })),
    });
  }
  if (units.length > 0) {
    sections.push({
      title: 'Units',
      rows: units.map(o => ({
        id: `office_${o.id}`,
        title: o.abbreviation,
        description: `${o.full_name} (${o.floor})`,
      })),
    });
  }

  await sendListMessage(
    phone,
    'Which office would you like to visit?',
    'Select Office',
    sections,
    env
  );
}

async function handleAskOffice(
  phone: string,
  listId: string | undefined,
  session: Session,
  sessionKey: string,
  env: Env
): Promise<void> {
  if (!listId?.startsWith('office_')) {
    await sendTextMessage(phone, 'Please select an office from the list.', env);
    await sendOfficeListMessage(phone, env);
    return;
  }

  const officeId = parseInt(listId.replace('office_', ''));
  const office = await env.DB.prepare(
    'SELECT id, abbreviation, full_name, office_type, head_officer FROM offices WHERE id = ?'
  ).bind(officeId).first<any>();

  if (!office) {
    await sendTextMessage(phone, 'Office not found. Please try again.', env);
    await sendOfficeListMessage(phone, env);
    return;
  }

  session.data.office_id = office.id;
  session.data.office_abbr = office.abbreviation;
  session.data.office_type = office.office_type;
  session.data.host_officer = office.head_officer;

  await sendPurposeListMessage(phone, env);
  await saveSession(env, sessionKey, { state: 'ASK_PURPOSE', data: session.data });
}

// ── ASK_PURPOSE ──

async function sendPurposeListMessage(phone: string, env: Env): Promise<void> {
  // Split 11 purposes into 2 sections (max 10 rows per section)
  const section1 = PURPOSES.slice(0, 6);
  const section2 = PURPOSES.slice(6);

  await sendListMessage(
    phone,
    'What is the purpose of your visit?',
    'Select Purpose',
    [
      {
        title: 'Common Purposes',
        rows: section1.map(p => ({ id: `purpose_${p}`, title: p })),
      },
      {
        title: 'Other Purposes',
        rows: section2.map(p => ({ id: `purpose_${p}`, title: p })),
      },
    ],
    env
  );
}

async function handleAskPurpose(
  phone: string,
  listId: string | undefined,
  session: Session,
  sessionKey: string,
  env: Env
): Promise<void> {
  if (!listId?.startsWith('purpose_')) {
    await sendTextMessage(phone, 'Please select a purpose from the list.', env);
    await sendPurposeListMessage(phone, env);
    return;
  }

  session.data.purpose = listId.replace('purpose_', '');

  await sendTextMessage(
    phone,
    'What organization are you from?\n\nType *skip* if not applicable.',
    env
  );
  await saveSession(env, sessionKey, { state: 'ASK_ORG', data: session.data });
}

// ── ASK_ORG ──

async function handleAskOrg(
  phone: string,
  text: string | null,
  session: Session,
  sessionKey: string,
  env: Env
): Promise<void> {
  const org = text?.trim();
  session.data.organization = org?.toLowerCase() === 'skip' ? null : (org || null);

  if (session.data.office_type === 'executive') {
    await sendTextMessage(
      phone,
      'Executive office visits require an appointment.\n\nPlease enter your preferred *date and time*.\n\nExamples:\n• _15/02/2026 10:00 AM_\n• _tomorrow 2pm_\n• _next Monday 9am_',
      env
    );
    await saveSession(env, sessionKey, { state: 'ASK_DATETIME', data: session.data });
  } else {
    // Non-executive: auto-set today, go to confirm
    const today = new Date().toISOString().split('T')[0];
    session.data.expected_date = today;
    session.data.expected_time = null;
    await sendConfirmationSummary(phone, session.data, env);
    await saveSession(env, sessionKey, { state: 'CONFIRM', data: session.data });
  }
}

// ── ASK_DATETIME ──

async function handleAskDateTime(
  phone: string,
  text: string | null,
  session: Session,
  sessionKey: string,
  env: Env
): Promise<void> {
  if (!text || text.trim().length < 3) {
    await sendTextMessage(phone, 'Please enter a valid date and time (e.g., 15/02/2026 10:00 AM):', env);
    return;
  }

  const parsed = parseDateTimeInput(text.trim());
  if (!parsed) {
    await sendTextMessage(
      phone,
      'Could not understand that date/time. Please try again.\n\nExamples:\n• _15/02/2026 10:00 AM_\n• _tomorrow 2pm_\n• _next Monday 9am_',
      env
    );
    return;
  }

  session.data.expected_date = parsed.date;
  session.data.expected_time = parsed.time;

  await sendConfirmationSummary(phone, session.data, env);
  await saveSession(env, sessionKey, { state: 'CONFIRM', data: session.data });
}

// ── CONFIRM ──

async function sendConfirmationSummary(
  phone: string,
  data: SessionData,
  env: Env
): Promise<void> {
  const isExecutive = data.office_type === 'executive';
  const dateDisplay = data.expected_date || 'Today';
  const timeDisplay = data.expected_time || 'Walk-in';

  let summary = `Please confirm your pre-registration:\n\n`;
  summary += `*Name:* ${data.visitor_name}\n`;
  summary += `*Office:* ${data.office_abbr}\n`;
  summary += `*Purpose:* ${data.purpose}\n`;
  if (data.organization) summary += `*Organization:* ${data.organization}\n`;
  summary += `*Date:* ${dateDisplay}\n`;
  summary += `*Time:* ${timeDisplay}\n`;
  if (isExecutive) {
    summary += `\n_This is an executive office. Your request will need approval from the secretary._`;
  }

  await sendButtonMessage(
    phone,
    summary,
    [
      { id: 'confirm', title: 'Confirm' },
      { id: 'cancel', title: 'Cancel' },
    ],
    env
  );
}

async function handleConfirm(
  phone: string,
  buttonId: string | undefined,
  session: Session,
  sessionKey: string,
  env: Env
): Promise<void> {
  if (buttonId === 'cancel') {
    await sendTextMessage(phone, 'Pre-registration cancelled. Send any message to start again.', env);
    await clearSession(env, sessionKey);
    return;
  }

  if (buttonId !== 'confirm') {
    await sendConfirmationSummary(phone, session.data, env);
    return;
  }

  await createPreRegistrationFromWhatsApp(phone, session.data, env);
  await clearSession(env, sessionKey);
}

// ── Create pre-registration ──

async function createPreRegistrationFromWhatsApp(
  phone: string,
  data: SessionData,
  env: Env
): Promise<void> {
  const qrToken = crypto.randomUUID().split('-')[0];
  const isExecutive = data.office_type === 'executive';
  const status = isExecutive ? 'pending' : 'confirmed';

  const result = await env.DB.prepare(`
    INSERT INTO pre_registrations
      (visitor_name, visitor_phone, visitor_organization, office_id, purpose, host_officer, expected_date, expected_time, status, qr_token, whatsapp_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.visitor_name,
    phone,
    data.organization || null,
    data.office_id,
    data.purpose,
    data.host_officer || 'Reception',
    data.expected_date,
    data.expected_time || null,
    status,
    qrToken,
    phone,
  ).run();

  const preRegId = result.meta.last_row_id;

  if (isExecutive) {
    await sendTextMessage(
      phone,
      `Your appointment request has been submitted.\n\n` +
      `*Reference:* #${preRegId}\n` +
      `*Office:* ${data.office_abbr}\n` +
      `*Status:* Pending Approval\n\n` +
      `You will receive a WhatsApp message once the secretary reviews your request.\n\n` +
      `To check your status anytime, send us a message and select "Check Status".`,
      env
    );
  } else {
    await sendTextMessage(
      phone,
      `Your pre-registration is confirmed!\n\n` +
      `*Reference:* #${preRegId}\n` +
      `*Office:* ${data.office_abbr}\n` +
      `*QR Code:* ${qrToken}\n\n` +
      `Show this code at reception for quick check-in. You can also share this message on your phone.\n\n` +
      `_Tip: Take a screenshot of this message for the reception desk._`,
      env
    );
  }

  await logMessage(env, {
    direction: 'outbound',
    wa_phone: phone,
    message_type: 'confirmation',
    content: `Pre-registration #${preRegId} created (${status})`,
    pre_registration_id: preRegId as number,
  });
}

// ── Status check ──

async function handleStatusCheck(phone: string, env: Env): Promise<void> {
  const regs = await env.DB.prepare(`
    SELECT pr.id, pr.visitor_name, pr.status, pr.expected_date, pr.expected_time,
           pr.qr_token, pr.decline_reason, o.abbreviation as office_abbr
    FROM pre_registrations pr
    JOIN offices o ON pr.office_id = o.id
    WHERE pr.whatsapp_phone = ?
    ORDER BY pr.created_at DESC
    LIMIT 5
  `).bind(phone).all();

  if (!regs.results.length) {
    await sendTextMessage(
      phone,
      'No pre-registrations found for your number.\n\nSend any message to start a new pre-registration.',
      env
    );
    return;
  }

  let msg = `Your recent pre-registrations:\n\n`;
  for (const r of regs.results as any[]) {
    const statusEmoji =
      r.status === 'confirmed' ? '\u2705' :
      r.status === 'pending' ? '\u23F3' :
      r.status === 'cancelled' ? '\u274C' :
      r.status === 'converted' ? '\u2705' : '\u2753';

    msg += `${statusEmoji} *#${r.id}* — ${r.office_abbr}\n`;
    msg += `   ${r.expected_date}${r.expected_time ? ' at ' + r.expected_time : ''}\n`;
    msg += `   Status: _${r.status}_\n`;
    if (r.qr_token && r.status === 'confirmed') {
      msg += `   QR: \`${r.qr_token}\`\n`;
    }
    if (r.decline_reason) {
      msg += `   Reason: _${r.decline_reason}_\n`;
    }
    msg += '\n';
  }

  msg += 'Send any message to start again.';
  await sendTextMessage(phone, msg, env);
}

// ── Office directory ──

async function handleOfficeDirectory(phone: string, env: Env): Promise<void> {
  const offices = await env.DB.prepare(
    'SELECT abbreviation, full_name, office_type, floor, room FROM offices WHERE is_active = TRUE ORDER BY office_type, abbreviation'
  ).all();

  let msg = '*OHCS Office Directory*\n\n';

  const groups: Record<string, any[]> = { executive: [], directorate: [], unit: [] };
  for (const o of offices.results as any[]) {
    groups[o.office_type]?.push(o);
  }

  if (groups.executive.length) {
    msg += '*Executive*\n';
    for (const o of groups.executive) {
      msg += `  ${o.abbreviation} — ${o.full_name}\n  _${o.floor}, Room ${o.room}_\n\n`;
    }
  }
  if (groups.directorate.length) {
    msg += '*Directorates*\n';
    for (const o of groups.directorate) {
      msg += `  ${o.abbreviation} — ${o.full_name}\n  _${o.floor}, Room ${o.room}_\n\n`;
    }
  }
  if (groups.unit.length) {
    msg += '*Units*\n';
    for (const o of groups.unit) {
      msg += `  ${o.abbreviation} — ${o.full_name}\n  _${o.floor}, Room ${o.room}_\n\n`;
    }
  }

  msg += 'Send any message to start again.';
  await sendTextMessage(phone, msg, env);
}

// ── Date/time parser ──

export function parseDateTimeInput(input: string): { date: string; time: string | null } | null {
  const now = new Date();

  // Try DD/MM/YYYY HH:MM AM/PM
  const formal = input.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i);
  if (formal) {
    const day = formal[1].padStart(2, '0');
    const month = formal[2].padStart(2, '0');
    const year = formal[3];
    let hour = parseInt(formal[4]);
    const min = formal[5] || '00';
    const ampm = formal[6]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    return {
      date: `${year}-${month}-${day}`,
      time: `${String(hour).padStart(2, '0')}:${min}`,
    };
  }

  // Try "tomorrow Xam/pm" or "today Xam/pm"
  const relative = input.match(/^(today|tomorrow)\s+(\d{1,2})\s*(am|pm)$/i);
  if (relative) {
    const d = new Date(now);
    if (relative[1].toLowerCase() === 'tomorrow') d.setDate(d.getDate() + 1);
    let hour = parseInt(relative[2]);
    const ampm = relative[3].toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    return {
      date: d.toISOString().split('T')[0],
      time: `${String(hour).padStart(2, '0')}:00`,
    };
  }

  // Try "next Monday/Tuesday/... Xam/pm"
  const nextDay = input.match(/^next\s+(monday|tuesday|wednesday|thursday|friday)\s+(\d{1,2})\s*(am|pm)$/i);
  if (nextDay) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const target = days.indexOf(nextDay[1].toLowerCase());
    const d = new Date(now);
    const current = d.getDay();
    const diff = ((target - current + 7) % 7) || 7;
    d.setDate(d.getDate() + diff);
    let hour = parseInt(nextDay[2]);
    const ampm = nextDay[3].toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    return {
      date: d.toISOString().split('T')[0],
      time: `${String(hour).padStart(2, '0')}:00`,
    };
  }

  // Try just a date DD/MM/YYYY
  const dateOnly = input.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dateOnly) {
    const day = dateOnly[1].padStart(2, '0');
    const month = dateOnly[2].padStart(2, '0');
    const year = dateOnly[3];
    return { date: `${year}-${month}-${day}`, time: null };
  }

  return null;
}

// ── Session helpers ──

async function saveSession(env: Env, key: string, session: Session): Promise<void> {
  await env.KV.put(key, JSON.stringify(session), { expirationTtl: SESSION_TTL });
}

async function clearSession(env: Env, key: string): Promise<void> {
  await env.KV.delete(key);
}
