import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";
import { LegalPageShell, LegalSection } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = buildMetadata(PAGE_SEO.privacy);

const LAST_UPDATED = "5 July 2026";

export default async function PrivacyPolicyPage() {
  const s = await getSettings();

  return (
    <LegalPageShell
      title="Privacy Policy"
      subtitle="How Fine Jewellery Buyers collects, uses and protects your personal information."
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="1. Who we are">
        <p>
          <strong>{s.business_name}</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a gold and fine
          jewellery buying business based at {s.address}. We operate the website{" "}
          <Link href="/" className="text-gold-dark hover:underline">
            finejewellerybuyers.co.uk
          </Link>{" "}
          and related services including online valuations, appointments and customer communications.
        </p>
        <p>
          For privacy enquiries, contact us at{" "}
          <a href={`mailto:${s.email}`} className="text-gold-dark hover:underline">
            {s.email}
          </a>{" "}
          or call{" "}
          <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-gold-dark hover:underline">
            {s.phone}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We may collect and process the following personal data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Contact details</strong> — name, email address, phone number and postal address when you submit
            a form, book an appointment, subscribe to our newsletter or contact us.
          </li>
          <li>
            <strong>Transaction information</strong> — details about items you wish to sell, photographs you upload,
            valuation notes, booking preferences and correspondence with our team.
          </li>
          <li>
            <strong>Identity information</strong> — where required by law for precious metals transactions, we may
            request proof of identity and address (e.g. passport, driving licence, utility bill).
          </li>
          <li>
            <strong>Technical data</strong> — IP address, browser type, device information and pages visited, collected
            via cookies and similar technologies (see Section 8).
          </li>
          <li>
            <strong>Marketing preferences</strong> — whether you have subscribed to emails or opted out of
            communications.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <p>We use your personal data to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide free valuations and respond to your enquiries</li>
          <li>Process bookings and manage appointments at our Hatton Garden office</li>
          <li>Arrange insured postage, assess items and complete purchases</li>
          <li>Make payments to you by bank transfer</li>
          <li>Send service-related emails (confirmations, appointment reminders, valuation replies)</li>
          <li>Send marketing emails where you have subscribed or given consent</li>
          <li>Comply with legal and regulatory obligations relating to precious metals and anti-money laundering</li>
          <li>Improve our website, services and customer experience</li>
          <li>Prevent fraud, spam and misuse of our forms</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Legal basis for processing (UK GDPR)">
        <p>We process personal data on the following lawful bases:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Contract</strong> — where processing is necessary to provide a valuation, appointment or purchase
            service you have requested.
          </li>
          <li>
            <strong>Legitimate interests</strong> — to operate and improve our business, prevent fraud and communicate
            with existing customers about similar services.
          </li>
          <li>
            <strong>Consent</strong> — for newsletter subscriptions and optional marketing communications. You may
            withdraw consent at any time.
          </li>
          <li>
            <strong>Legal obligation</strong> — where we must retain records or verify identity under UK law.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Marketing communications">
        <p>
          If you subscribe via our website popup, newsletter form or opt in when submitting an enquiry, we may send you
          emails about gold prices, selling tips and offers. You can unsubscribe at any time by contacting us or using
          the unsubscribe link in any marketing email.
        </p>
        <p>
          We do not sell your personal data to third parties for their marketing purposes.
        </p>
      </LegalSection>

      <LegalSection title="6. Sharing your information">
        <p>We may share data with trusted third parties only where necessary:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email and hosting providers to deliver our website and communications</li>
          <li>Payment and banking partners to process transfers to you</li>
          <li>Royal Mail or courier services for insured postage</li>
          <li>Professional advisers (accountants, lawyers) where required</li>
          <li>Regulators or law enforcement when legally required</li>
        </ul>
        <p>All processors are required to handle your data securely and only for specified purposes.</p>
      </LegalSection>

      <LegalSection title="7. Data retention">
        <p>
          We keep personal data only for as long as necessary — typically for the duration of your enquiry or
          transaction, plus up to seven years where required for accounting, tax or regulatory records. Marketing
          contact data is retained until you unsubscribe or ask us to delete it.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          Our website uses essential cookies to function and may use analytics cookies (such as Google Analytics) to
          understand how visitors use the site. You can control non-essential cookies through your browser settings.
          Continued use of our site after being informed of cookies constitutes acceptance of essential cookies.
        </p>
      </LegalSection>

      <LegalSection title="9. Your rights">
        <p>Under UK data protection law, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access a copy of the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data (subject to legal retention requirements)</li>
          <li>Object to or restrict certain processing</li>
          <li>Withdraw consent for marketing at any time</li>
          <li>Lodge a complaint with the Information Commissioner&apos;s Office (ICO) at ico.org.uk</li>
        </ul>
        <p>
          To exercise your rights, email{" "}
          <a href={`mailto:${s.email}`} className="text-gold-dark hover:underline">
            {s.email}
          </a>
          . We will respond within one month.
        </p>
      </LegalSection>

      <LegalSection title="10. Security">
        <p>
          We implement appropriate technical and organisational measures to protect your data, including secure
          connections (HTTPS), access controls and staff training. No method of transmission over the internet is
          completely secure; we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top of this page
          will change when we do. We encourage you to review this page periodically.
        </p>
      </LegalSection>

      <p className="text-sm text-muted-foreground pt-6 border-t border-border">
        See also our{" "}
        <Link href="/terms" className="text-gold-dark hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
