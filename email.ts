import sgMail from "@sendgrid/mail";

export function initEmail() {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not set – emails disabled");
    return;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendEmailPerProperty(property: any) {
  if (!process.env.SENDGRID_API_KEY) return;

  const msg = {
    to: process.env.ALERT_EMAIL,
    from: process.env.ALERT_EMAIL,
    subject: `New Unsold Auction Property (${property.source})`,
    text: `
Source: ${property.source}
Bedrooms: ${property.bedrooms ?? "unknown"}
Postcode: ${property.postcode ?? "unknown"}
Guide price: ${property.guidePrice ?? "unknown"}

Link:
${property.sourceUrl}
`,
  };

  try {
    await sgMail.send(msg);
  } catch (err) {
    console.error("Email send failed:", err);
  }
}