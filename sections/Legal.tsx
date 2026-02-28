import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type LegalType = 'terms' | 'privacy' | 'cookies';

// ─── Content ──────────────────────────────────────────────────────────────────

const TERMS = {
  title: 'Terms of Use',
  updated: 'Last updated: February 2026',
  sections: [
    { heading: '1. Acceptance', body: `By accessing albasax.com, you agree to these Terms of Use.` },
    { heading: '2. Eligibility', body: `You must be at least 16 years old to create an account.` },
    { heading: '3. Accounts', body: `Users are responsible for:\n• Maintaining confidentiality of login credentials\n• Providing accurate information\n• All activities under their account\n\nWe reserve the right to suspend accounts for violations.` },
    { heading: '4. Public Profiles', body: `Users may create public profiles. You are solely responsible for information made publicly available.` },
    { heading: '5. Intellectual Property', body: `All content on this website — including music, branding, images, logos, and artistic materials — is protected by intellectual property laws. Unauthorized reproduction, distribution, or commercial exploitation is strictly prohibited.` },
    { heading: '6. Upcoming Store Section', body: `The "Shop" section is currently under development. No products are available for purchase and no commercial transactions are conducted. Subscribing for launch updates does not constitute a purchase, reservation, or contractual relationship.` },
    { heading: '7. Limitation of Liability', body: `The website is provided "as is". To the maximum extent permitted by law, the owner shall not be liable for indirect damages, data loss, or service interruptions.` },
    { heading: '8. External Platforms', body: `We are not responsible for third-party platforms linked on the website.` },
    { heading: '9. Governing Law', body: `These Terms are governed by the laws of Italy. For EU consumers, mandatory consumer protection laws of their country of residence may apply. The competent court shall be that of the Data Controller's residence, unless mandatory law provides otherwise.` },
    { heading: '10. Modifications', body: `We reserve the right to update these Terms at any time. The English version prevails over translated versions.` },
  ],
};

const PRIVACY = {
  title: 'Privacy Policy',
  updated: 'Last updated: February 2026',
  sections: [
    { heading: '1. Data Controller', body: `This website (albasax.com) is operated by Daniele Dominici, residing in Italy (the "Data Controller").\n\nFor privacy-related inquiries, please contact:\nprivacy@albasax.com` },
    { heading: '2. Scope', body: `This Privacy Policy explains how personal data is collected and processed when you:\n• Visit the website\n• Create an account\n• Subscribe to the newsletter\n• Subscribe for store launch updates\n• Interact with public user profiles\n\nThis Policy complies with: EU General Data Protection Regulation (GDPR), Italian data protection laws, UK GDPR (where applicable), and applicable international privacy principles.` },
    { heading: '3. Data Collected', body: `We may collect:\n\na) Account Data\n• Username\n• Email address\n• Encrypted password\n\nb) Newsletter & Launch Update Data\n• Email address\n• Subscription confirmation (double opt-in record)\n• Preferences (if provided)\nEmails are processed using Resend.\n\nc) Technical Data\n• IP address (anonymized where required)\n• Browser type\n• Device data\n• Usage statistics\nWebsite analytics are performed using Google Analytics with IP anonymization and consent-based activation.` },
    { heading: '4. Legal Basis', body: `We process personal data based on:\n• Consent (newsletter, analytics cookies)\n• Contract necessity (account creation)\n• Legitimate interest (security, fraud prevention)\n• Legal obligations` },
    { heading: '5. Purpose of Processing', body: `Data is processed to:\n• Manage user accounts\n• Provide website functionality\n• Send newsletters and launch updates\n• Improve website performance\n• Ensure security\n\nSubscription to store updates does not create any purchase or contractual obligation.` },
    { heading: '6. External Links', body: `The website contains links to third-party platforms, including:\n• Spotify\n• YouTube\n• Meta\n• Apple\n\nClicking these links may result in independent data processing by those platforms.` },
    { heading: '7. International Transfers', body: `Some service providers may process data outside the European Economic Area. Where required, transfers are safeguarded through Standard Contractual Clauses (SCCs) or equivalent legal mechanisms.` },
    { heading: '8. Data Retention', body: `• Account data: until account deletion\n• Newsletter data: until unsubscribe\n• Technical logs: limited retention period\n• Consent records: retained for compliance purposes` },
    { heading: '9. User Rights', body: `Under GDPR, you may:\n• Access your data\n• Request correction\n• Request deletion\n• Restrict processing\n• Request data portability\n• Withdraw consent\n• Object to processing\n\nRequests can be sent to: privacy@albasax.com\n\nYou may also lodge a complaint with the Italian Data Protection Authority.` },
    { heading: '10. Children', body: `Registration is permitted only to individuals aged 16 years or older. If we become aware of data collected from users under 16 without proper authorization, it will be deleted.` },
    { heading: '11. Security', body: `We implement appropriate technical and organizational measures to protect personal data.` },
    { heading: '12. Changes', body: `We may update this Privacy Policy from time to time. The English version prevails over any translated version.` },
  ],
};

const COOKIES = {
  title: 'Cookie Policy',
  updated: 'Last updated: February 2026',
  sections: [
    { heading: '1. What Are Cookies?', body: `Cookies are small text files stored on your device when you visit a website.` },
    { heading: '2. Types of Cookies Used', body: `` },
    { heading: 'Essential Cookies', body: `Necessary for login, security, and core functionality. These cannot be disabled and do not require your consent under GDPR.` },
    { heading: 'Analytics Cookies', body: `Used via Google Analytics to understand website usage. IP anonymization is active. Activated only after user consent.` },
    { heading: '3. Managing Consent', body: `You may:\n• Accept or reject cookies through the banner\n• Change preferences at any time via "Cookie Settings" in the footer\n• Disable cookies via browser settings` },
    { heading: '4. Cookie Duration', body: `Essential session cookies are deleted when you close your browser. Consent preferences are stored for up to 12 months, after which the banner is shown again.` },
    { heading: '5. Google Analytics Settings', body: `Google Analytics is configured with:\n• IP anonymization active\n• Data retention: 14 months\n• Google Signals: disabled\n• Remarketing: disabled\n• Consent Mode v2 compliant (analytics blocked until consent)` },
    { heading: '6. Updates', body: `This Cookie Policy may be updated periodically.` },
  ],
};
    {
      heading: '2. Intellectual Property',
      body: `All content on this Website — including but not limited to music, photographs, videos, graphics, logos, and text — is the exclusive property of Albasax or its licensors and is protected by Italian and international copyright law. Unauthorized reproduction, distribution, or use of any content without prior written permission is strictly prohibited.`,
    },
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
