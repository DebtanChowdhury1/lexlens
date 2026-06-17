import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — LexLens',
  description: 'Privacy Policy for LexLens AI Contract Analyzer.',
};

const LAST_UPDATED = 'June 17, 2026';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-[#CBD5E1]">
      <h1 className="text-4xl font-bold text-[#F8FAFC] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Privacy Policy
      </h1>
      <p className="text-sm text-[#475569] mb-12">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-10 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-[#F8FAFC]">Account information:</strong> Name, email address, and username provided during sign-up via Clerk.</li>
            <li><strong className="text-[#F8FAFC]">Document content:</strong> Text extracted from contracts you upload or paste. This is sent to our AI providers (Groq, Google Gemini) for analysis and stored in our database associated with your account.</li>
            <li><strong className="text-[#F8FAFC]">Analysis results:</strong> Risk scores, clause breakdowns, summaries, and metadata generated from your documents.</li>
            <li><strong className="text-[#F8FAFC]">Usage data:</strong> Request timestamps, processing times, and error logs used for service improvement and debugging.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide, operate, and improve the LexLens Service</li>
            <li>To process your documents and generate analysis results</li>
            <li>To maintain your analysis history in your dashboard</li>
            <li>To respond to support requests</li>
            <li>To detect and prevent abuse of the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">3. Third-Party Services</h2>
          <p>We share document text with the following AI providers to generate analysis:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong className="text-[#F8FAFC]">Groq</strong> (primary AI provider) — text is sent for inference and not retained by Groq beyond the request.</li>
            <li><strong className="text-[#F8FAFC]">Google Gemini</strong> (fallback AI provider) — governed by Google&apos;s AI data usage policies.</li>
            <li><strong className="text-[#F8FAFC]">Clerk</strong> — handles authentication and stores account credentials.</li>
            <li><strong className="text-[#F8FAFC]">MongoDB Atlas</strong> — stores analysis results in encrypted cloud storage.</li>
          </ul>
          <p className="mt-3 text-[#94A3B8] text-sm">
            We do not sell your personal data or document content to any third party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">4. Data Retention</h2>
          <p>
            Your analysis results are stored until you delete them or delete your account. You can delete individual contracts from your dashboard at any time. To delete all your data, use the &ldquo;Delete Account Data&rdquo; option in Settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">5. Your Rights (GDPR &amp; CCPA)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong className="text-[#F8FAFC]">Access:</strong> Request a copy of the data we hold about you.</li>
            <li><strong className="text-[#F8FAFC]">Erasure:</strong> Delete all your data using the Settings page or by contacting us.</li>
            <li><strong className="text-[#F8FAFC]">Portability:</strong> Export your analysis history as PDF reports.</li>
            <li><strong className="text-[#F8FAFC]">Correction:</strong> Update your account information in Settings.</li>
            <li><strong className="text-[#F8FAFC]">Objection:</strong> Contact us to object to specific processing activities.</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@lexlens.ai" className="text-violet-400 hover:underline">privacy@lexlens.ai</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">6. Security</h2>
          <p>
            We implement industry-standard security measures including HTTPS encryption in transit, encrypted storage at rest, and authentication via Clerk. However, no system is completely secure. Do not upload documents containing passwords, payment card numbers, or government ID numbers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">7. Cookies</h2>
          <p>
            LexLens uses only essential cookies required for authentication (managed by Clerk). We do not use advertising cookies or third-party tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes via email or a notice on the Service. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">9. Contact</h2>
          <p>
            For privacy questions or data requests:{' '}
            <a href="mailto:privacy@lexlens.ai" className="text-violet-400 hover:underline">
              privacy@lexlens.ai
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
