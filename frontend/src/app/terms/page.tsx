import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";
import { LegalPageShell, LegalSection } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = buildMetadata(PAGE_SEO.terms);

const LAST_UPDATED = "5 July 2026";

export default async function TermsOfServicePage() {
  const s = await getSettings();

  return (
    <LegalPageShell
      title="Terms of Service"
      subtitle="Terms and conditions for using Fine Jewellery Buyers website and selling services."
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="1. Agreement">
        <p>
          By accessing our website or using our services, you agree to these Terms of Service. If you do not agree,
          please do not use our website or services. These terms apply to all visitors, customers and sellers using{" "}
          {s.business_name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
        </p>
      </LegalSection>

      <LegalSection title="2. About our services">
        <p>
          {s.business_name} buys gold, scrap gold, silver, platinum, diamonds, gemstones, luxury watches and fine
          jewellery from members of the public. We are based at {s.address}. Services include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Free online valuations via our website forms</li>
          <li>In-person valuations at our Hatton Garden showroom by appointment</li>
          <li>Fully insured postal service for customers across the UK</li>
          <li>Instant or same-day bank transfer payment on accepted offers</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Valuations are not binding offers">
        <p>
          Any price estimate, calculator result or verbal/email indication is a <strong>valuation only</strong>, not a
          firm offer. Final prices depend on inspection, testing (including gold carat, weight, purity and condition),
          live market rates at the time of assessment and our expert appraisal. We reserve the right to revise any
          valuation after physical inspection.
        </p>
        <p>
          Online calculator and live rate displays show indicative buying prices linked to market data and are subject
          to change without notice.
        </p>
      </LegalSection>

      <LegalSection title="4. Selling to us">
        <p>When you sell items to us, you confirm that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are the legal owner of the items, or authorised to sell them on the owner&apos;s behalf</li>
          <li>The items are not stolen, subject to dispute, hire purchase or third-party claim</li>
          <li>All information you provide is accurate and complete</li>
          <li>You are at least 18 years of age</li>
        </ul>
        <p>
          We may refuse to purchase any item without giving a reason. We may require proof of identity and address
          before completing a transaction, in line with UK precious metals and anti-money laundering regulations.
        </p>
      </LegalSection>

      <LegalSection title="5. Postage and insured collection">
        <p>
          Where we provide a free insured postal pack or collection service, you must pack items securely following
          our instructions. Risk passes to us once items are received and signed for at our premises. If you decline
          our final offer, we will return your items to you free of charge within the UK using appropriate insured
          delivery, unless otherwise agreed.
        </p>
        <p>
          You are responsible for accurately declaring contents and complying with Royal Mail or courier requirements.
        </p>
      </LegalSection>

      <LegalSection title="6. Payment">
        <p>
          On acceptance of our offer, payment is made by bank transfer to a UK bank account in your name unless
          otherwise agreed in writing. We aim to pay on the same business day once assessment is complete and offer
          is accepted. We are not liable for delays caused by incorrect bank details provided by you or your bank.
        </p>
      </LegalSection>

      <LegalSection title="7. Designer and luxury items">
        <p>
          For branded jewellery (including Cartier, Tiffany, Boodles and similar), valuations depend on authenticity,
          condition, model, hallmarks, receipts and current market demand. We may request supporting documentation.
          Counterfeit or misrepresented items will not be purchased and may be reported to the appropriate authorities.
        </p>
      </LegalSection>

      <LegalSection title="8. Website use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use our website for unlawful purposes or submit false information</li>
          <li>Attempt to gain unauthorised access to our systems or data</li>
          <li>Scrape, copy or reproduce website content without permission</li>
          <li>Submit spam, automated or fraudulent form submissions</li>
        </ul>
        <p>
          We may suspend access to our website or services if we reasonably believe these terms have been breached.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          All content on this website — including text, images, logos and design — is owned by or licensed to{" "}
          {s.business_name} and protected by copyright and trademark law. You may not reproduce it without our written
          consent. Brand names mentioned on our site (e.g. Cartier, Tiffany) belong to their respective owners and are
          used only to describe items we buy.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          To the fullest extent permitted by law, we shall not be liable for indirect, incidental or consequential
          losses arising from use of our website or services. Our total liability for any claim relating to our services
          is limited to the amount paid to you for the specific transaction in question, except where liability cannot
          be excluded by law (including death or personal injury caused by negligence, or fraud).
        </p>
        <p>
          We do not guarantee uninterrupted access to our website. Live rates and calculator tools are provided for
          guidance only.
        </p>
      </LegalSection>

      <LegalSection title="11. Third-party links">
        <p>
          Our website may contain links to third-party websites (e.g. Google Reviews, Trustpilot). We are not
          responsible for their content or privacy practices.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive
          jurisdiction of the courts of England and Wales.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes">
        <p>
          We may update these Terms of Service at any time. Changes take effect when posted on this page with an
          updated &quot;Last updated&quot; date. Continued use of our services after changes constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          Questions about these terms? Contact {s.business_name}:
        </p>
        <ul className="list-none space-y-1">
          <li>
            Email:{" "}
            <a href={`mailto:${s.email}`} className="text-gold-dark hover:underline">
              {s.email}
            </a>
          </li>
          <li>
            Phone:{" "}
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-gold-dark hover:underline">
              {s.phone}
            </a>
          </li>
          <li>Address: {s.address}</li>
          <li>Hours: {s.opening_hours}</li>
        </ul>
      </LegalSection>

      <p className="text-sm text-muted-foreground pt-6 border-t border-border">
        See also our{" "}
        <Link href="/privacy" className="text-gold-dark hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
