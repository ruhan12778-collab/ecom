import nodemailer from 'nodemailer'

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return cachedTransporter
}

interface PurchaseEmailCourse {
  title: string
  slug: string
  price: number
}

interface PurchaseEmailParams {
  to: string
  userName: string
  orderNumber: string
  courses: PurchaseEmailCourse[]
}

function gbp(n: number): string {
  return `£${n.toFixed(2)}`
}

function buildHtml({ userName, orderNumber, courses }: Omit<PurchaseEmailParams, 'to'>): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const total = courses.reduce((s, c) => s + Number(c.price), 0)

  const courseRows = courses
    .map((c) => {
      const url = `${appUrl}/courses/${c.slug}`
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #eee;">
            <div style="font-size:16px;font-weight:600;color:#1f2937;">${escapeHtml(c.title)}</div>
            <div style="font-size:14px;color:#6b7280;margin-top:4px;">${gbp(Number(c.price))}</div>
            <a href="${url}" style="display:inline-block;margin-top:10px;padding:8px 16px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Go to course →</a>
          </td>
        </tr>`
    })
    .join('')

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;padding:32px;">
        <tr><td>
          <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a;">Thanks for your purchase, ${escapeHtml(userName)} 🎉</h1>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Your order <strong>${escapeHtml(orderNumber)}</strong> is confirmed. You can start learning right away.</p>
          <table width="100%" cellpadding="0" cellspacing="0">${courseRows}</table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr>
              <td style="padding:16px 0;font-size:16px;color:#0f172a;"><strong>Total</strong></td>
              <td align="right" style="padding:16px 0;font-size:16px;color:#0f172a;"><strong>${gbp(total)}</strong></td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="margin:0;color:#6b7280;font-size:13px;">If you have any questions, just reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function buildText({ userName, orderNumber, courses }: Omit<PurchaseEmailParams, 'to'>): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const total = courses.reduce((s, c) => s + Number(c.price), 0)
  const lines = [
    `Thanks for your purchase, ${userName}!`,
    ``,
    `Order: ${orderNumber}`,
    ``,
    `Your courses:`,
    ...courses.map((c) => `  • ${c.title} (${gbp(Number(c.price))}) — ${appUrl}/courses/${c.slug}`),
    ``,
    `Total: ${gbp(total)}`,
    ``,
    `If you have any questions, just reply to this email.`,
  ]
  return lines.join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendPurchaseConfirmationEmail(params: PurchaseEmailParams): Promise<void> {
  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: params.to,
      subject: `Your CodeEd order ${params.orderNumber} is confirmed`,
      text: buildText(params),
      html: buildHtml(params),
    })
    console.log(`[email] purchase confirmation sent to ${params.to} (messageId=${info.messageId})`)
  } catch (error) {
    console.error('[email] purchase confirmation failed:', error)
  }
}
