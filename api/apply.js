const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, role, message, cv } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email and role are required.' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const safeText = (s) => (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

    const attachments = [];
    if (cv && cv.data && cv.name) {
      attachments.push({
        filename: cv.name,
        content: Buffer.from(cv.data, 'base64'),
      });
    }

    await resend.emails.send({
      from: 'Futuora Careers <onboarding@resend.dev>',
      to: ['amithnalh@outlook.com'],
      reply_to: email,
      subject: `Application: ${role} — ${name}`,
      attachments,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f0f7f8;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(6,51,71,0.08);">
    <div style="background:#031e2c;padding:28px 32px 22px;">
      <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#00C8D4;">Futuora Engineering — Careers</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#c8e4ec;letter-spacing:-0.03em;">New Application Received</h1>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f0f7f8;">
          <td style="padding:10px 0;font-weight:700;color:#4a7080;width:130px;">Role</td>
          <td style="padding:10px 0;color:#063347;font-weight:600;">${safeText(role)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f7f8;">
          <td style="padding:10px 0;font-weight:700;color:#4a7080;">Name</td>
          <td style="padding:10px 0;color:#063347;">${safeText(name)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f7f8;">
          <td style="padding:10px 0;font-weight:700;color:#4a7080;">Email</td>
          <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#00C8D4;">${safeText(email)}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #f0f7f8;">
          <td style="padding:10px 0;font-weight:700;color:#4a7080;">Phone</td>
          <td style="padding:10px 0;color:#063347;">${safeText(phone) || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-weight:700;color:#4a7080;vertical-align:top;">Cover Note</td>
          <td style="padding:10px 0;color:#063347;line-height:1.6;">${safeText(message) || '—'}</td>
        </tr>
      </table>
      ${attachments.length > 0
        ? `<div style="margin-top:20px;padding:12px 16px;background:#f0f7f8;border-radius:8px;font-size:13px;color:#063347;"><strong style="color:#00C8D4;">CV attached</strong> — ${safeText(cv.name)}</div>`
        : `<div style="margin-top:20px;padding:12px 16px;background:#fff8f0;border-radius:8px;font-size:13px;color:#a06030;">No CV attached.</div>`
      }
    </div>
    <div style="padding:16px 32px 24px;border-top:1px solid #f0f7f8;">
      <p style="margin:0;font-size:12px;color:#4a7080;">Hit reply to respond directly to the applicant.</p>
    </div>
  </div>
</body>
</html>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Apply API error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send. Please try again.' });
  }
};
