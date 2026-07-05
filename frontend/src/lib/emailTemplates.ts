export type EmailTemplatePreset = {
  id: string;
  label: string;
  name: string;
  subject: string;
  audience: "subscribed" | "newsletter" | "all";
  body_html: string;
};

export const EMAIL_TEMPLATE_PRESETS: EmailTemplatePreset[] = [
  {
    id: "gold-rate-alert",
    label: "Gold rates rising — sell now",
    name: "Gold Rate Alert",
    subject: "Gold prices are up — great time to sell",
    audience: "newsletter",
    body_html: `<p style="margin:0 0 16px;">Hi {{name}},</p>
<p style="margin:0 0 16px;">Gold market rates have <strong style="color:#D97706;">increased</strong> — now is an excellent time to sell your gold, scrap gold or unwanted jewellery.</p>
<p style="margin:0 0 16px;">Visit our Hatton Garden showroom for a free, no-obligation valuation and <strong>instant cash</strong> on the spot. We also buy Cartier, Tiffany, Boodles and designer pieces at premium prices.</p>
<p style="margin:0 0 16px;">We pay above scrap gold value for authenticated luxury brand jewellery.</p>
<p style="margin:0;">Best regards,<br/><strong>Fine Jewellery Buyers</strong></p>`,
  },
  {
    id: "newsletter-welcome",
    label: "Welcome newsletter subscribers",
    name: "Newsletter Welcome",
    subject: "Welcome — you're on our list",
    audience: "newsletter",
    body_html: `<p style="margin:0 0 16px;">Hi {{name}},</p>
<p style="margin:0 0 16px;">Thank you for subscribing! You'll receive gold price alerts, selling tips and exclusive offers from Hatton Garden.</p>
<p style="margin:0 0 16px;">Whenever you're ready to sell gold, diamonds, watches or designer jewellery, we're here with free valuations and same-day payment.</p>
<p style="margin:0;">Warm regards,<br/><strong>Fine Jewellery Buyers</strong></p>`,
  },
  {
    id: "general-update",
    label: "General customer update",
    name: "Customer Update",
    subject: "An update from Fine Jewellery Buyers",
    audience: "subscribed",
    body_html: `<p style="margin:0 0 16px;">Hi {{name}},</p>
<p style="margin:0 0 16px;">We wanted to share a quick update with you.</p>
<p style="margin:0 0 16px;">[Type your message here — e.g. opening hours, special offers, or reminders to visit us in Hatton Garden.]</p>
<p style="margin:0;">Best regards,<br/><strong>Fine Jewellery Buyers</strong></p>`,
  },
];

export function audienceLabel(audience: string, filterTags?: string[] | null): string {
  if (filterTags?.includes("newsletter-popup")) return "Newsletter subscribers";
  if (audience === "all") return "All contacts";
  return "All subscribed contacts";
}
