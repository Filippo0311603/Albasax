
import React, { useState, useMemo } from 'react';
import {
  Mail, Lock, User as UserIcon, ArrowRight, Loader, Phone,
  Calendar, Globe, ShieldCheck, Eye, EyeOff, RefreshCw,
  CheckCircle, AlertCircle, ChevronDown
} from 'lucide-react';
import { User } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';
import { supabase } from '../supabaseClient';

// â”€â”€â”€ Password strength â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface PasswordCheck { label: string; pass: boolean }
function checkPassword(pw: string): PasswordCheck[] {
  return [
    { label: 'At least 8 characters',           pass: pw.length >= 8 },
    { label: 'One uppercase letter (A-Z)',        pass: /[A-Z]/.test(pw) },
    { label: 'One number (0-9)',                  pass: /[0-9]/.test(pw) },
    { label: 'One special character (!@#$â€¦)',     pass: /[^A-Za-z0-9]/.test(pw) },
  ];
}

// â”€â”€â”€ Age validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function isOldEnough(birthDate: string, minAge = 16): boolean {
  if (!birthDate) return false;
  const today = new Date();
  const dob   = new Date(birthDate);
  const age   = today.getFullYear() - dob.getFullYear();
  const m     = today.getMonth() - dob.getMonth();
  return age > minAge || (age === minAge && m >= 0);
}

// â”€â”€â”€ Country list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COUNTRIES = [
  'Italy','United States','United Kingdom','Germany','France','Spain',
  'Netherlands','Belgium','Switzerland','Austria','Portugal','Poland',
  'Sweden','Norway','Denmark','Finland','Canada','Australia','Japan',
  'Brazil','Argentina','Mexico','Other'
];

interface AuthProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

const Auth: React.FC<AuthProps> = ({ user, onLogin, onLogout }) => {
  const [isLogin, setIsLogin]       = useState(true);
  const [loading, setLoading]       = useState(false);
  const [errorMSG, setErrorMSG]     = useState('');
  const [isEditing, setIsEditing]   = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  // After registration â†’ show "check your email" screen
  const [emailSent, setEmailSent]   = useState(false);
  const [sentEmail, setSentEmail]   = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyState, setVerifyState] = useState<'idle'|'verifying'|'success'|'error'>('idle');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Email confirmation via token_hash ─────────────────────────────────────
  React.useEffect(() => {
    // Support both `token` and `token_hash`, and handle HashRouter URLs
    let token = searchParams.get('token') || searchParams.get('token_hash');
    let typeParam = searchParams.get('type');

    if (!token) {
      const hash = window.location.hash || '';
      const qIdx = hash.indexOf('?');
      if (qIdx !== -1) {
        const qs = new URLSearchParams(hash.slice(qIdx + 1));
        token = token || qs.get('token') || qs.get('token_hash');
        typeParam = typeParam || qs.get('type');
      }
    }

    if (!token || typeParam !== 'signup') return;

    setVerifyState('verifying');
    (supabase.auth as any).verifyOtp({ token, type: 'signup' })
      .then(({ error }: any) => {
        if (error) {
          setVerifyState('error');
        } else {
          setVerifyState('success');
          // Remove query/hash params without navigating away so the success UI remains visible
          try {
            const cleanHash = '#/auth';
            window.history.replaceState(null, '', window.location.pathname + cleanHash);
          } catch (e) {
            // ignore
          }
        }
      });
  }, [searchParams]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{title: string; message: string; type: 'success' | 'error'}>({
    title: '', message: '', type: 'success'
  });

  // â”€â”€ Registration form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [formData, setFormData] = useState({
    firstName:   '',
    lastName:    '',
    email:       '',
    phone:       '',
    birthDate:   '',
    country:     '',
    password:    '',
    confirmPassword: '',
    newsletter:  true,
    terms:       false,
  });
  const fd = (field: string, val: string | boolean) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  // â”€â”€ Edit profile form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [editData, setEditData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  React.useEffect(() => {
    if (user) setEditData({
      firstName: user.firstName || '',
      lastName:  user.lastName  || '',
      email:     user.email     || '',
      password:  '',
    });
  }, [user]);

  // â”€â”€ Password strength â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pwChecks = useMemo(() => checkPassword(formData.password), [formData.password]);
  const pwStrong = pwChecks.every(c => c.pass);

  // â”€â”€ Resend cooldown timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const showModal = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModalConfig({ title, message, type });
    setModalOpen(true);
  };

  // â”€â”€ LOGIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMSG('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email:    formData.email,
        password: formData.password,
      });
      if (error) {
        // Supabase returns a generic error for unconfirmed email
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMSG('Please confirm your email before logging in. Check your inbox.');
        } else {
          throw new Error(error.message);
        }
        return;
      }
      onLogin({
        email:     data.user.email!,
        name:      `${data.user.user_metadata?.first_name ?? ''} ${data.user.user_metadata?.last_name ?? ''}`.trim() || data.user.email!,
        firstName: data.user.user_metadata?.first_name,
        lastName:  data.user.user_metadata?.last_name,
      });
    } catch (error: any) {
      setErrorMSG(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ REGISTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMSG('');

    // Client-side validations
    if (!pwStrong) {
      setErrorMSG('Password does not meet security requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMSG('Passwords do not match.');
      return;
    }
    if (!isOldEnough(formData.birthDate, 16)) {
      setErrorMSG('You must be at least 16 years old to register.');
      return;
    }
    if (!formData.terms) {
      setErrorMSG('You must accept the Terms of Service and Privacy Policy.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMSG('A valid phone number is required.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email:    formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name:  formData.lastName.trim(),
            phone:      formData.phone.trim(),
            birth_date: formData.birthDate,
            country:    formData.country,
          },
          // The confirmation email redirect points to your site
          emailRedirectTo: `${window.location.origin}/#/auth`,
        },
      });
      if (error) throw new Error(error.message);

      // Subscribe to newsletter if opted in
      if (formData.newsletter && data.user) {
        await supabase.from('newsletter_subscribers').upsert(
          {
            email:  formData.email,
            name:   `${formData.firstName} ${formData.lastName}`.trim(),
            source: 'registration',
            active: true,
          },
          { onConflict: 'email' }
        );
      }

      // â† data.session is null when email confirmation is required
      setSentEmail(formData.email);
      setEmailSent(true);
      setResendCooldown(60);

    } catch (error: any) {
      setErrorMSG(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ RESEND CONFIRMATION EMAIL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type:  'signup',
        email: sentEmail,
        options: { emailRedirectTo: `${window.location.origin}/#/auth` },
      });
      if (error) throw error;
      setResendCooldown(60);
      showModal('Email Sent', 'Check your inbox again. The link expires in 24 hours.', 'success');
    } catch (err: any) {
      showModal('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ UPDATE PROFILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates: Parameters<typeof supabase.auth.updateUser>[0] = {
        data: { first_name: editData.firstName, last_name: editData.lastName },
      };
      if (editData.email && editData.email !== user?.email) updates.email = editData.email;
      if (editData.password && editData.password.length > 0) updates.password = editData.password;

      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw new Error(error.message);

      onLogin({
        email:     data.user.email!,
        name:      `${data.user.user_metadata?.first_name ?? ''} ${data.user.user_metadata?.last_name ?? ''}`.trim(),
        firstName: data.user.user_metadata?.first_name,
        lastName:  data.user.user_metadata?.last_name,
      });
      setIsEditing(false);
      showModal('Profile Updated', 'Your details have been successfully updated.', 'success');
    } catch (error: any) {
      showModal('Update Failed', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ Shared input classes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const inputCls = 'w-full bg-black/40 border border-gray-800 p-4 text-sm focus:border-gold outline-none transition-all placeholder:text-gray-700';
  const labelCls = 'text-[10px] tracking-widest uppercase font-bold text-gray-400 flex items-center';

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <div className="pt-28 pb-20 px-4 min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-black to-[#111]">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

      {/* â”€â”€ LOGGED IN: Profile view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* ── EMAIL VERIFICATION STATES ──────────────────────────────────────── */}
      {verifyState === 'verifying' && (
        <div className="max-w-md w-full glass p-10 shadow-2xl border-gray-800 text-center space-y-6 animate-in fade-in duration-500">
          <div className="mx-auto w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
            <Loader size={36} className="text-gold animate-spin" />
          </div>
          <h2 className="text-2xl font-serif">Verifying your account…</h2>
          <p className="text-gray-500 text-sm">Please wait a moment.</p>
        </div>
      )}

      {verifyState === 'success' && (
        <div className="max-w-md w-full glass p-10 shadow-2xl border-gray-800 text-center space-y-6 animate-in fade-in duration-500">
          <div className="mx-auto w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
            <CheckCircle size={36} className="text-gold" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif">Account Verified!</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your email has been confirmed. Welcome to the inner circle.
            </p>
          </div>
          <button
            onClick={() => { setVerifyState('idle'); setIsLogin(true); }}
            className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight size={14} /> Continue to Login
          </button>
        </div>
      )}

      {verifyState === 'error' && (
        <div className="max-w-md w-full glass p-10 shadow-2xl border-gray-800 text-center space-y-6 animate-in fade-in duration-500">
          <div className="mx-auto w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center border border-red-800/40">
            <AlertCircle size={36} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif">Verification Failed</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The link may have expired or already been used.<br />
              Try registering again or request a new link.
            </p>
          </div>
          <button
            onClick={() => { setVerifyState('idle'); setIsLogin(false); }}
            className="w-full py-4 border border-gray-700 text-gray-300 hover:border-gold hover:text-gold font-bold uppercase tracking-widest text-xs transition-all"
          >
            ← Back to Register
          </button>
        </div>
      )}

      {verifyState === 'idle' && (user ? (
        <div className="max-w-md w-full glass p-8 md:p-12 shadow-2xl border-gray-800 text-center space-y-8 animate-in fade-in duration-500">
          <div className="mx-auto w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center border-2 border-gold">
            <span className="text-4xl font-serif text-gold">
              {(user.firstName || user.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          {!isEditing ? (
            <>
              <div className="space-y-1">
                <h2 className="text-3xl font-serif text-white">{user.name}</h2>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              <div className="pt-4 space-y-4">
                <button onClick={() => setIsEditing(true)}
                  className="w-full py-4 border border-gold text-gold hover:bg-gold hover:text-white font-bold uppercase tracking-widest text-xs transition-all rounded-sm">
                  Edit Profile
                </button>
                <button onClick={async () => { await supabase.auth.signOut(); onLogout(); navigate('/'); }}
                  className="w-full py-4 bg-gray-900 text-gray-400 hover:bg-red-900/20 hover:text-red-500 font-bold uppercase tracking-widest text-xs transition-all rounded-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-5 text-left">
              <h3 className="text-xl font-serif text-white text-center">Edit Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>First name</label>
                  <input type="text" value={editData.firstName}
                    onChange={e => setEditData({ ...editData, firstName: e.target.value })}
                    className="w-full bg-black/40 border border-gray-800 p-3 text-sm focus:border-gold outline-none text-white" />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Last name</label>
                  <input type="text" value={editData.lastName}
                    onChange={e => setEditData({ ...editData, lastName: e.target.value })}
                    className="w-full bg-black/40 border border-gray-800 p-3 text-sm focus:border-gold outline-none text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}><Mail size={11} className="mr-2" />Email</label>
                <input type="email" value={editData.email}
                  onChange={e => setEditData({ ...editData, email: e.target.value })}
                  className="w-full bg-black/40 border border-gray-800 p-3 text-sm focus:border-gold outline-none text-white" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}><Lock size={11} className="mr-2" />New Password <span className="normal-case text-gray-600 ml-1">(optional)</span></label>
                <input type="password" value={editData.password}
                  onChange={e => setEditData({ ...editData, password: e.target.value })}
                  className="w-full bg-black/40 border border-gray-800 p-3 text-sm focus:border-gold outline-none text-white"
                  placeholder="Leave blank to keep current" />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-gray-800 text-gray-400 hover:bg-gray-700 font-bold uppercase tracking-widest text-xs rounded-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-gold text-white font-bold uppercase tracking-widest text-xs rounded-sm disabled:opacity-50">
                  {loading ? 'Savingâ€¦' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>

      /* â”€â”€ EMAIL CONFIRMATION SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      ) : emailSent ? (
        <div className="max-w-md w-full glass p-10 shadow-2xl border-gray-800 text-center space-y-8 animate-in fade-in duration-500">
          <div className="mx-auto w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
            <Mail size={36} className="text-gold" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-serif">Check Your Email</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We sent a confirmation link to<br />
              <span className="text-white font-semibold">{sentEmail}</span>
            </p>
            <p className="text-gray-500 text-xs">
              Click the link in the email to activate your account.
              The link expires in <span className="text-gold">24 hours</span>.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="w-full py-4 border border-gray-700 text-gray-300 hover:border-gold hover:text-gold font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
            </button>
            <button
              onClick={() => { setEmailSent(false); setIsLogin(true); }}
              className="w-full py-3 text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              â† Back to login
            </button>
          </div>
          <div className="flex items-start gap-2 text-left bg-yellow-900/10 border border-yellow-800/30 p-4 rounded">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-yellow-700 text-xs leading-relaxed">
              Don't see it? Check your spam folder. The sender is <em>no-reply@albasax.com</em>.
            </p>
          </div>
        </div>

      /* â”€â”€ LOGIN / REGISTER FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      ) : (
        <div className={`w-full glass shadow-2xl border-gray-800 transition-all duration-300 ${isLogin ? 'max-w-md p-8 md:p-12' : 'max-w-xl p-8'}`}>
          <header className="text-center mb-8">
            <h2 className="text-4xl font-serif mb-2">
              {isLogin ? 'Welcome Back' : 'Join the Inner Circle'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isLogin
                ? 'Log in to access your account'
                : 'Create your account â€” all fields are required for security verification'}
            </p>
            {errorMSG && (
              <p className="mt-4 text-red-400 text-xs bg-red-500/10 p-3 rounded border border-red-500/20 flex items-start gap-2 text-left">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {errorMSG}
              </p>
            )}
          </header>

          {/* â”€â”€ LOGIN FORM â”€â”€ */}
          {isLogin && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className={labelCls}><Mail size={12} className="mr-2" />Email Address</label>
                <input type="email" required placeholder="name@example.com"
                  value={formData.email} onChange={e => fd('email', e.target.value)}
                  className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}><Lock size={12} className="mr-2" />Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.password} onChange={e => fd('password', e.target.value)}
                    className={inputCls + ' pr-12'} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gold hover:bg-gold/90 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center group">
                {loading ? <Loader className="animate-spin mr-2" size={16} /> : null}
                Log In
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* â”€â”€ REGISTER FORM â”€â”€ */}
          {!isLogin && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={labelCls}><UserIcon size={11} className="mr-2" />First Name</label>
                  <input type="text" required placeholder="John"
                    value={formData.firstName} onChange={e => fd('firstName', e.target.value)}
                    className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}><UserIcon size={11} className="mr-2" />Last Name</label>
                  <input type="text" required placeholder="Doe"
                    value={formData.lastName} onChange={e => fd('lastName', e.target.value)}
                    className={inputCls} />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className={labelCls}><Mail size={11} className="mr-2" />Email Address</label>
                <input type="email" required placeholder="name@example.com"
                  value={formData.email} onChange={e => fd('email', e.target.value)}
                  className={inputCls} />
              </div>

              {/* Phone + Country */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={labelCls}><Phone size={11} className="mr-2" />Phone</label>
                  <input type="tel" required placeholder="+39 333 111 2222"
                    value={formData.phone} onChange={e => fd('phone', e.target.value)}
                    className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}><Globe size={11} className="mr-2" />Country</label>
                  <div className="relative">
                    <select required value={formData.country} onChange={e => fd('country', e.target.value)}
                      className={inputCls + ' appearance-none pr-8 cursor-pointer'}>
                      <option value="">Selectâ€¦</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Date of birth */}
              <div className="space-y-2">
                <label className={labelCls}><Calendar size={11} className="mr-2" />Date of Birth <span className="normal-case text-gray-600 ml-1">(must be 16+)</span></label>
                <input type="date" required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                  value={formData.birthDate} onChange={e => fd('birthDate', e.target.value)}
                  className={inputCls + ' text-gray-300'} />
                {formData.birthDate && !isOldEnough(formData.birthDate, 16) && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> You must be at least 16 years old.
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className={labelCls}><Lock size={11} className="mr-2" />Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required placeholder="Create a strong password"
                    value={formData.password} onChange={e => fd('password', e.target.value)}
                    className={inputCls + ' pr-12'} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength checklist */}
                {formData.password.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    {pwChecks.map(c => (
                      <p key={c.label} className={`text-[10px] flex items-center gap-1 transition-colors ${c.pass ? 'text-green-500' : 'text-gray-600'}`}>
                        <CheckCircle size={10} className={c.pass ? 'text-green-500' : 'text-gray-700'} />
                        {c.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <label className={labelCls}><Lock size={11} className="mr-2" />Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPw ? 'text' : 'password'} required placeholder="Repeat your password"
                    value={formData.confirmPassword} onChange={e => fd('confirmPassword', e.target.value)}
                    className={`${inputCls} pr-12 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-700' : ''}`} />
                  <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors">
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> Passwords do not match.
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.newsletter}
                    onChange={e => fd('newsletter', e.target.checked)}
                    className="mt-0.5 form-checkbox bg-transparent border-gray-700 text-gold rounded-sm shrink-0" />
                  <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                    Receive newsletter for tour dates and new releases (optional)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" required checked={formData.terms}
                    onChange={e => fd('terms', e.target.checked)}
                    className="mt-0.5 form-checkbox bg-transparent border-gray-700 text-gold rounded-sm shrink-0" />
                  <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                    I accept the <span className="text-gold underline cursor-pointer">Terms of Service</span> and{' '}
                    <span className="text-gold underline cursor-pointer">Privacy Policy</span>. I understand my data will be processed securely. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-2 bg-gold/5 border border-gold/10 p-3 rounded">
                <ShieldCheck size={14} className="text-gold mt-0.5 shrink-0" />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Your data is encrypted and stored securely. Phone number and date of birth are used only for identity verification and fraud prevention.
                </p>
              </div>

              <button type="submit" disabled={loading || !pwStrong || formData.password !== formData.confirmPassword}
                className="w-full py-4 bg-gold hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center group">
                {loading ? <Loader className="animate-spin mr-2" size={16} /> : null}
                Create Account
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          <footer className="mt-6 text-center pt-6 border-t border-gray-900">
            <p className="text-xs text-gray-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => { setIsLogin(l => !l); setErrorMSG(''); }}
                className="ml-2 text-gold font-bold hover:underline">
                {isLogin ? 'Sign up now' : 'Log in here'}
              </button>
            </p>
          </footer>
        </div>
      ))}
    </div>
  );
};

export default Auth;
