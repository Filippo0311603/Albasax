import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type LegalType = 'terms' | 'privacy' | 'cookies';

// ─── Content ──────────────────────────────────────────────────────────────────

const TERMS = {
  title: 'Terms of Use',
  updated: 'Last updated: February 2026',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      body: `By accessing and using albasax.com (the "Website"), you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use the Website.`,
    },
    {
      heading: '2. Intellectual Property',
      body: `All content on this Website — including but not limited to music, photographs, videos, graphics, logos, and text — is the exclusive property of Albasax or its licensors and is protected by Italian and international copyright law. Unauthorized reproduction, distribution, or use of any content without prior written permission is strictly prohibited.`,
    },
    {
      heading: '3. User Accounts',
      body: `When you create an account on the Website, you are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. You must be at least 16 years old to register. You agree to provide accurate and truthful information during registration.`,
    },
    {
      heading: '4. Purchases and Shop',
      body: `All purchases made through the Website are subject to product availability. Prices are displayed in euros (€) and include applicable VAT where required by law. Payments are processed securely through Stripe. We reserve the right to cancel or refuse any order at our discretion.`,
    },
    {
      heading: '5. Newsletter',
      body: `By subscribing to the newsletter, you consent to receive promotional emails from Albasax. You may unsubscribe at any time by clicking the link included in every email. We will not share your email address with third parties for marketing purposes.`,
    },
    {
      heading: '6. Prohibited Conduct',
      body: `You agree not to: use the Website for any unlawful purpose; attempt to gain unauthorized access to any part of the Website; reproduce, sell, or commercially exploit any content without permission; upload or transmit any harmful, offensive, or infringing content.`,
    },
    {
      heading: '7. Limitation of Liability',
      body: `The Website is provided "as is" without warranties of any kind. Albasax shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Website or inability to access it.`,
    },
    {
      heading: '8. Changes to Terms',
      body: `We reserve the right to update these Terms at any time. Continued use of the Website after changes constitutes your acceptance of the revised Terms. We will notify registered users of material changes via email.`,
    },
    {
      heading: '9. Governing Law',
      body: `These Terms are governed by the laws of Italy. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Italy.`,
    },
    {
      heading: '10. Contact',
      body: `For any questions regarding these Terms, please contact us at: info@albasax.com`,
    },
  ],
};

const PRIVACY = {
  title: 'Privacy Policy',
  updated: 'Last updated: February 2026',
  sections: [
    {
      heading: '1. Data Controller',
      body: `The data controller for personal data collected through albasax.com is Albasax Music. Contact: info@albasax.com`,
    },
    {
      heading: '2. Data We Collect',
      body: `We collect the following personal data:\n• Account registration: first name, last name, email address, phone number, date of birth, country, and gender.\n• Newsletter subscription: email address and name.\n• Purchase history: order details associated with your account.\n• Technical data: IP address, browser type, and usage data collected automatically via cookies.`,
    },
    {
      heading: '3. Legal Basis for Processing (GDPR)',
      body: `We process your data on the following legal bases:\n• Contract performance: to manage your account and process orders.\n• Legitimate interest: to improve our services and prevent fraud.\n• Consent: for newsletter communications (which you may withdraw at any time).\n• Legal obligation: to comply with applicable laws (e.g., tax and accounting requirements).`,
    },
    {
      heading: '4. How We Use Your Data',
      body: `Your data is used to: create and manage your user account; process and fulfil orders; send newsletters and promotional communications (with your consent); prevent fraud and ensure platform security; comply with legal obligations.`,
    },
    {
      heading: '5. Data Sharing',
      body: `We do not sell your personal data. We may share data with trusted third-party service providers solely to operate our Website:\n• Supabase (database and authentication infrastructure)\n• Stripe (payment processing)\n• Vercel (website hosting)\nAll providers are contractually bound to protect your data and comply with GDPR.`,
    },
    {
      heading: '6. Data Retention',
      body: `We retain your personal data for as long as your account is active. You may request deletion of your account and associated data at any time. Order data may be retained for up to 10 years for legal and accounting purposes.`,
    },
    {
      heading: '7. Your Rights (GDPR)',
      body: `Under the General Data Protection Regulation (EU 2016/679), you have the right to: access your personal data; correct inaccurate data; request erasure ("right to be forgotten"); restrict or object to processing; data portability; withdraw consent at any time.\nTo exercise any of these rights, contact us at: info@albasax.com`,
    },
    {
      heading: '8. International Transfers',
      body: `Some of our service providers may process data outside the European Economic Area. In such cases, we ensure appropriate safeguards are in place (e.g., Standard Contractual Clauses approved by the European Commission).`,
    },
    {
      heading: '9. Security',
      body: `We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, destruction, or alteration. All data is transmitted over HTTPS and stored in encrypted form.`,
    },
    {
      heading: '10. Complaints',
      body: `You have the right to lodge a complaint with your national data protection authority. In Italy: Garante per la Protezione dei Dati Personali — www.garanteprivacy.it`,
    },
  ],
};

const COOKIES = {
  title: 'Cookie Policy',
  updated: 'Last updated: February 2026',
  sections: [
    {
      heading: 'What Are Cookies?',
      body: `Cookies are small text files stored on your device when you visit a website. They are widely used to make websites work, improve user experience, and provide information to website owners.`,
    },
    {
      heading: 'Cookies We Use',
      body: ``,
    },
    {
      heading: 'Strictly Necessary Cookies',
      body: `These cookies are essential for the Website to function and cannot be disabled. They include:\n• Authentication session cookies (Supabase) — keep you logged in during your visit.\n• Security cookies — protect against cross-site request forgery.\nThese do not require your consent under GDPR.`,
    },
    {
      heading: 'Functional Cookies',
      body: `These cookies remember your preferences and improve your experience. They are only set with your consent. Examples: language preferences, UI settings.`,
    },
    {
      heading: 'Analytics Cookies',
      body: `At this time, albasax.com does not use third-party analytics cookies (e.g., Google Analytics). If we introduce them in the future, we will update this policy and request your consent.`,
    },
    {
      heading: 'How to Manage Cookies',
      body: `You can control and delete cookies through your browser settings:\n• Chrome: Settings → Privacy and Security → Cookies\n• Firefox: Settings → Privacy & Security → Cookies\n• Safari: Preferences → Privacy\n• Edge: Settings → Privacy, Search, and Services\n\nNote: disabling strictly necessary cookies may affect the Website's functionality.`,
    },
    {
      heading: 'Cookie Duration',
      body: `Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period (typically 7 days for authentication tokens) or until you delete them manually.`,
    },
    {
      heading: 'Contact',
      body: `For any questions about our use of cookies, contact us at: info@albasax.com`,
    },
  ],
};

const CONTENT: Record<LegalType, typeof TERMS> = {
  terms: TERMS,
  privacy: PRIVACY,
  cookies: COOKIES,
};

// ─── Component ────────────────────────────────────────────────────────────────

const Legal: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const legalType = (type as LegalType) || 'terms';
  const content = CONTENT[legalType] ?? CONTENT.terms;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0a0a] pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-xs uppercase tracking-widest mb-12"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Header */}
        <div className="mb-12 space-y-3">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">Albasax</p>
          <h1 className="text-5xl font-serif text-white">{content.title}</h1>
          <p className="text-gray-600 text-xs tracking-widest">{content.updated}</p>
        </div>

        {/* Tab links */}
        <div className="flex gap-6 mb-16 border-b border-gray-800 pb-6">
          {(['terms', 'privacy', 'cookies'] as LegalType[]).map((t) => (
            <Link
              key={t}
              to={`/legal/${t}`}
              className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
                legalType === t ? 'text-gold border-b-2 border-gold pb-1' : 'text-gray-500 hover:text-white'
              }`}
            >
              {t === 'terms' ? 'Terms of Use' : t === 'privacy' ? 'Privacy Policy' : 'Cookie Policy'}
            </Link>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {content.sections.map((section, i) => (
            <div key={i} className="space-y-3">
              <h2 className="text-lg font-serif text-white">{section.heading}</h2>
              {section.body && (
                <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                  {section.body}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="mt-20 pt-10 border-t border-gray-800 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <p className="text-gray-700 text-[10px] tracking-widest uppercase">© {new Date().getFullYear()} Albasax Music</p>
        </div>
      </div>
    </div>
  );
};

export default Legal;
