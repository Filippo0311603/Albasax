import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Lock, Plus, Trash2, Eye, EyeOff, Users, ArrowLeft, Image,
  Type, Link as LinkIcon, AlertCircle, Upload, Loader, Music2,
  MapPin, Newspaper, ImageIcon, ShoppingBag, X, Check, Save,
  Mail, Calendar, ExternalLink,
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://albasax-production.up.railway.app';

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = 'newsletter' | 'music' | 'tour' | 'press' | 'media' | 'shop';

// ─── Newsletter types ─────────────────────────────────────────────────────────
type BlockType = 'heading' | 'text' | 'button' | 'image' | 'divider' | 'spacer';
interface Block {
  id: string;
  type: BlockType;
  content: string;
  href?: string;
}
function uid() { return Math.random().toString(36).slice(2, 9); }
const defaultBlocks = (): Block[] => [
  { id: '1', type: 'heading', content: '' },
  { id: '2', type: 'text', content: '' },
];
function blockToHtml(block: Block): string {
  switch (block.type) {
    case 'heading': return `<h2 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#ffffff;line-height:1.25;letter-spacing:-0.01em;">${block.content}</h2>`;
    case 'text':    return `<p style="margin:0 0 20px;font-size:15px;line-height:1.85;color:#9ca3af;font-weight:300;">${block.content.replace(/\n/g, '<br>')}</p>`;
    case 'button':  return `<div style="text-align:center;margin:36px 0;"><a href="${block.href || '#'}" style="display:inline-block;padding:16px 48px;background:transparent;color:#c5a643;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.35em;text-decoration:none;border:1px solid #c5a643;">${block.content}</a></div>`;
    case 'image':   return `<div style="margin:28px 0;"><img src="${block.content}" alt="" style="width:100%;max-width:100%;display:block;"></div>`;
    case 'divider': return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;"><tr><td style="background:linear-gradient(90deg,transparent,#2a2a2a,transparent);height:1px;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
    case 'spacer':  return `<div style="height:32px;"></div>`;
    default:        return '';
  }
}
function blocksToHtml(blocks: Block[]): string { return blocks.map(blockToHtml).join('\n'); }

// ─── Generic image upload helper ──────────────────────────────────────────────
const ImageUpload: React.FC<{ value: string; onChange: (url: string) => void; bucket?: string }> = ({
  value, onChange, bucket = 'newsletter-images',
}) => {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const base = 'w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-700 border border-gray-800 px-3 py-2';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) { setErr(err.message || 'Upload fallito'); }
    finally { setUploading(false); if (ref.current) ref.current.value = ''; }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-all disabled:opacity-50">
          {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? 'Caricamento…' : 'Carica file'}
        </button>
        <span className="text-gray-700 text-xs">o incolla URL:</span>
        <input className={`${base} flex-1`} placeholder="https://…" value={value} onChange={e => onChange(e.target.value)} />
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {err && <p className="text-red-500 text-xs">{err}</p>}
      {value && <img src={value} alt="preview" className="max-h-24 rounded border border-gray-800 object-contain" />}
    </div>
  );
};

// ─── Field helper ─────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold block">{label}</label>
    {children}
  </div>
);
const inp = 'w-full bg-transparent border border-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-gold transition-all placeholder:text-gray-700';
const sel = `${inp} cursor-pointer`;

// ─── Newsletter Preview ───────────────────────────────────────────────────────
const NewsletterPreview: React.FC<{ subject: string; blocks: Block[] }> = ({ subject, blocks }) => (
  <div className="bg-[#080808] border border-gray-900 p-4 rounded text-sm overflow-auto max-h-[75vh]">
    <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Oggetto:</p>
    <p className="text-white font-semibold mb-5">{subject || '—'}</p>
    <div style={{ maxWidth: 540, margin: '0 auto', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
      <div style={{ background: 'linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a)', height: 2 }} />
      <div style={{ background: '#0f0f0f', padding: '28px 32px 22px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 4px', fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#c5a643', fontWeight: 700 }}>— ALBASAX —</p>
        <p style={{ margin: 0, fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#4b4b4b' }}>Official Newsletter</p>
      </div>
      <div style={{ background: '#1a1a1a', height: 1 }} />
      <div style={{ background: '#0f0f0f', padding: '20px 36px 0' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6b6b6b' }}>Ciao <span style={{ color: '#c5a643', fontWeight: 600 }}>[nome]</span>,</p>
      </div>
      <div style={{ background: '#0f0f0f', padding: '20px 36px 32px' }}>
        {blocks.map(block => {
          if (block.type === 'heading') return <h2 key={block.id} style={{ margin: '0 0 18px', fontFamily: "Georgia,'Times New Roman',serif", fontSize: 24, fontWeight: 400, color: '#ffffff', lineHeight: 1.25 }}>{block.content || <em style={{ color: '#333' }}>Titolo…</em>}</h2>;
          if (block.type === 'text') return <p key={block.id} style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.85, color: '#9ca3af', fontWeight: 300, whiteSpace: 'pre-wrap' }}>{block.content || <em style={{ color: '#333' }}>Testo…</em>}</p>;
          if (block.type === 'button') return <div key={block.id} style={{ textAlign: 'center', margin: '28px 0' }}><span style={{ display: 'inline-block', padding: '13px 36px', background: 'transparent', color: '#c5a643', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35em', border: '1px solid #c5a643' }}>{block.content || 'Bottone'}</span></div>;
          if (block.type === 'image') return block.content ? <img key={block.id} src={block.content} alt="" style={{ width: '100%', margin: '20px 0', display: 'block' }} /> : <div key={block.id} style={{ background: '#1a1a1a', height: 80, margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#333', fontSize: 11 }}>Immagine</span></div>;
          if (block.type === 'divider') return <div key={block.id} style={{ background: 'linear-gradient(90deg,transparent,#2a2a2a,transparent)', height: 1, margin: '24px 0' }} />;
          if (block.type === 'spacer') return <div key={block.id} style={{ height: 24 }} />;
          return null;
        })}
      </div>
      <div style={{ background: 'linear-gradient(90deg,transparent,#1f1f1f,transparent)', height: 1 }} />
      <div style={{ background: '#0a0a0a', padding: '24px 32px 28px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 3px', fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#c5a643', fontWeight: 600 }}>ALBASAX</p>
        <p style={{ margin: 0, fontSize: 8, color: '#2a2a2a' }}>Music • Official Newsletter</p>
      </div>
      <div style={{ background: 'linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a)', height: 2 }} />
    </div>
  </div>
);

// ─── Newsletter Block Row ─────────────────────────────────────────────────────
const BlockRow: React.FC<{ block: Block; onChange: (b: Block) => void; onDelete: () => void; canDelete: boolean }> = ({ block, onChange, onDelete, canDelete }) => {
  const base = 'w-full bg-transparent text-white text-sm outline-none resize-none placeholder:text-gray-700';
  return (
    <div className="group flex gap-3 items-start py-3 border-b border-gray-900">
      <span className="mt-1 text-[9px] uppercase tracking-widest text-gray-700 w-14 flex-shrink-0 pt-1">{block.type}</span>
      <div className="flex-1 space-y-2">
        {block.type === 'heading' && <input className={`${base} text-xl font-serif`} placeholder="Titolo email…" value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} />}
        {block.type === 'text' && <textarea rows={3} className={`${base} leading-relaxed`} placeholder="Testo paragrafo…" value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} />}
        {block.type === 'button' && <div className="space-y-2">
          <input className={base} placeholder="Testo bottone" value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} />
          <input className={`${base} text-gold text-xs`} placeholder="URL…" value={block.href || ''} onChange={e => onChange({ ...block, href: e.target.value })} />
        </div>}
        {block.type === 'image' && <ImageUpload value={block.content} onChange={url => onChange({ ...block, content: url })} />}
        {(block.type === 'divider' || block.type === 'spacer') && <p className="text-gray-700 text-xs italic">{block.type === 'divider' ? '── linea ──' : '── spazio ──'}</p>}
      </div>
      {canDelete && <button onClick={onDelete} className="mt-1 opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={14} /></button>}
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type: 'ok' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 border text-sm shadow-xl ${type === 'ok' ? 'border-gold/40 bg-black text-gold' : 'border-red-800 bg-black text-red-400'}`}>
    {type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={12} /></button>
  </div>
);

// ─── Main Admin component ─────────────────────────────────────────────────────
const Admin: React.FC = () => {
  const navigate = useNavigate();

  // Auth
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState('');

  // UI
  const [activeTab, setActiveTab] = useState<Tab>('newsletter');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'error' } | null>(null);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const showToast = (msg: string, type: 'ok' | 'error' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Newsletter state ──
  const [subCount, setSubCount] = useState<number | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [nlSubject, setNlSubject] = useState('');
  const [nlPreview, setNlPreview] = useState('');
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks());
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // ── Music state ──
  const [musicList, setMusicList] = useState<any[]>([]);
  const [musicForm, setMusicForm] = useState({ title: '', year: new Date().getFullYear().toString(), type: 'Single', cover_url: '', spotify_url: '', apple_url: '' });
  const [musicSaving, setMusicSaving] = useState(false);

  // ── Tour state ──
  const [tourList, setTourList] = useState<any[]>([]);
  const [tourForm, setTourForm] = useState({ date: '', venue: '', location: '', status: 'Available', ticket_url: '' });
  const [tourSaving, setTourSaving] = useState(false);

  // ── Press state ──
  const [pressList, setPressList] = useState<any[]>([]);
  const [pressForm, setPressForm] = useState({ title: '', outlet: '', date: '', excerpt: '', image_url: '', url: '' });
  const [pressSaving, setPressSaving] = useState(false);

  // ── Media state ──
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [mediaForm, setMediaForm] = useState({ type: 'image', url: '', thumbnail: '', title: '' });
  const [mediaSaving, setMediaSaving] = useState(false);

  // ── Shop state ──
  const [shopList, setShopList] = useState<any[]>([]);
  const [shopForm, setShopForm] = useState({ name: '', description: '', price: '', image_url: '', category: 'vinyl', stock: '0', stripe_price_id: '' });
  const [shopSaving, setShopSaving] = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthErr('');
    const res = await fetch(`${SERVER_URL}/api/admin/subscribers`, {
      headers: { 'x-admin-secret': secret },
    }).catch(() => null);
    if (!res || !res.ok) { setAuthErr('Password errata o server non raggiungibile.'); return; }
    const data = await res.json();
    setSubCount(data.count ?? 0);
    if (data.subscribers) setSubscribers(data.subscribers);
    setAuthed(true);
    loadAll();
  };

  const loadAll = async () => {
    const [m, t, p, med, s] = await Promise.all([
      supabase.from('music_releases').select('*').order('sort_order').order('created_at'),
      supabase.from('tour_dates').select('*').order('date'),
      supabase.from('press_articles').select('*').order('sort_order').order('created_at'),
      supabase.from('media_gallery').select('*').order('sort_order').order('created_at'),
      supabase.from('products').select('*').order('created_at'),
    ]);
    if (m.data) setMusicList(m.data);
    if (t.data) setTourList(t.data);
    if (p.data) setPressList(p.data);
    if (med.data) setMediaList(med.data);
    if (s.data) setShopList(s.data);
  };

  // ── Newsletter subscribers ─────────────────────────────────────────────────
  const deleteSubscriber = async (id: string) => {
    const res = await fetch(`${SERVER_URL}/api/admin/subscribers/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': secret },
    }).catch(() => null);
    if (!res || !res.ok) { showToast('Errore eliminazione iscritto', 'error'); return; }
    setSubscribers(prev => prev.filter(s => s.id !== id));
    setSubCount(prev => (prev ?? 1) - 1);
    showToast('Iscritto eliminato');
  };

  // ── Newsletter ────────────────────────────────────────────────────────────
  const handleSendNewsletter = async () => {
    if (!nlSubject.trim()) { setSendResult({ error: "Inserisci l'oggetto." }); return; }
    const htmlBody = blocksToHtml(blocks);
    if (!htmlBody.trim()) { setSendResult({ error: 'Aggiungi almeno un blocco.' }); return; }
    setSending(true); setSendResult(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/send-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ subject: nlSubject.trim(), html: htmlBody, previewText: nlPreview.trim() }),
      });
      const data = await res.json();
      if (data.error) { setSendResult({ error: data.error }); setSending(false); return; }
      if (data.dispatching && data.jobId) {
        setSendResult({ dispatching: true, total: data.total, sent: 0, failed: 0, done: false });
        const jobId = data.jobId;
        const poll = setInterval(async () => {
          try {
            const sr = await fetch(`${SERVER_URL}/api/admin/newsletter-status/${jobId}`, { headers: { 'x-admin-secret': secret } });
            const status = await sr.json();
            setSendResult({ dispatching: !status.done, ...status });
            if (status.done) { clearInterval(poll); setSending(false); }
          } catch { /* ignore */ }
        }, 3000);
      } else { setSendResult(data); setSending(false); }
    } catch { setSendResult({ error: 'Errore di rete.' }); setSending(false); }
  };

  // ── Music CRUD ────────────────────────────────────────────────────────────
  const saveMusic = async () => {
    if (!musicForm.title.trim() || !musicForm.year.trim()) { showToast('Titolo e anno obbligatori', 'error'); return; }
    setMusicSaving(true);
    const { error } = await supabase.from('music_releases').insert([{
      ...musicForm, sort_order: musicList.length,
    }]);
    setMusicSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Singolo/Album aggiunto!');
    setMusicForm({ title: '', year: new Date().getFullYear().toString(), type: 'Single', cover_url: '', spotify_url: '', apple_url: '' });
    const { data } = await supabase.from('music_releases').select('*').order('sort_order').order('created_at');
    if (data) setMusicList(data);
  };
  const deleteMusic = async (id: string) => {
    await supabase.from('music_releases').delete().eq('id', id);
    setMusicList(prev => prev.filter(r => r.id !== id));
    showToast('Eliminato');
  };

  // ── Tour CRUD ─────────────────────────────────────────────────────────────
  const saveTour = async () => {
    if (!tourForm.date || !tourForm.venue.trim() || !tourForm.location.trim()) { showToast('Data, venue e location obbligatori', 'error'); return; }
    setTourSaving(true);
    const { error } = await supabase.from('tour_dates').insert([tourForm]);
    setTourSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Data aggiunta!');
    setTourForm({ date: '', venue: '', location: '', status: 'Available', ticket_url: '' });
    const { data } = await supabase.from('tour_dates').select('*').order('date');
    if (data) setTourList(data);
  };
  const deleteTour = async (id: string) => {
    await supabase.from('tour_dates').delete().eq('id', id);
    setTourList(prev => prev.filter(r => r.id !== id));
    showToast('Eliminato');
  };

  // ── Press CRUD ────────────────────────────────────────────────────────────
  const savePress = async () => {
    if (!pressForm.title.trim() || !pressForm.outlet.trim() || !pressForm.url.trim()) { showToast('Titolo, outlet e URL obbligatori', 'error'); return; }
    setPressSaving(true);
    const { error } = await supabase.from('press_articles').insert([{
      ...pressForm, sort_order: pressList.length,
    }]);
    setPressSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Articolo aggiunto!');
    setPressForm({ title: '', outlet: '', date: '', excerpt: '', image_url: '', url: '' });
    const { data } = await supabase.from('press_articles').select('*').order('sort_order').order('created_at');
    if (data) setPressList(data);
  };
  const deletePress = async (id: string) => {
    await supabase.from('press_articles').delete().eq('id', id);
    setPressList(prev => prev.filter(r => r.id !== id));
    showToast('Eliminato');
  };

  // ── Media CRUD ────────────────────────────────────────────────────────────
  const saveMedia = async () => {
    if (!mediaForm.url.trim()) { showToast('URL immagine/video obbligatorio', 'error'); return; }
    setMediaSaving(true);
    const { error } = await supabase.from('media_gallery').insert([{
      ...mediaForm, sort_order: mediaList.length,
    }]);
    setMediaSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Aggiunto alla galleria!');
    setMediaForm({ type: 'image', url: '', thumbnail: '', title: '' });
    const { data } = await supabase.from('media_gallery').select('*').order('sort_order').order('created_at');
    if (data) setMediaList(data);
  };
  const deleteMedia = async (id: string) => {
    await supabase.from('media_gallery').delete().eq('id', id);
    setMediaList(prev => prev.filter(r => r.id !== id));
    showToast('Eliminato');
  };

  // ── Shop CRUD ─────────────────────────────────────────────────────────────
  const saveShop = async () => {
    if (!shopForm.name.trim() || !shopForm.price) { showToast('Nome e prezzo obbligatori', 'error'); return; }
    setShopSaving(true);
    const { error } = await supabase.from('products').insert([{
      name: shopForm.name.trim(),
      description: shopForm.description.trim(),
      price: parseFloat(shopForm.price),
      image_url: shopForm.image_url,
      category: shopForm.category,
      stock: parseInt(shopForm.stock) || 0,
      stripe_price_id: shopForm.stripe_price_id.trim() || null,
      active: true,
    }]);
    setShopSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Prodotto aggiunto!');
    setShopForm({ name: '', description: '', price: '', image_url: '', category: 'vinyl', stock: '0', stripe_price_id: '' });
    const { data } = await supabase.from('products').select('*').order('created_at');
    if (data) setShopList(data);
  };
  const deleteShop = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setShopList(prev => prev.filter(r => r.id !== id));
    showToast('Eliminato');
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass border border-gray-800 p-10 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-[10px] tracking-widest uppercase text-gold font-bold">Albasax</p>
          <h1 className="text-3xl font-serif text-white">Admin Panel</h1>
          <p className="text-gray-600 text-xs">Accesso riservato</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="password" placeholder="Password admin" value={secret} onChange={e => setSecret(e.target.value)} required
              className="w-full bg-transparent border border-gray-800 pl-9 pr-4 py-3 text-sm text-white outline-none focus:border-gold transition-all" />
          </div>
          {authErr && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{authErr}</p>}
          <button type="submit" className="w-full py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all">Accedi</button>
        </form>
      </div>
    </div>
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'newsletter', label: 'Newsletter', icon: <Mail size={14} /> },
    { id: 'music',      label: 'Musica',     icon: <Music2 size={14} /> },
    { id: 'tour',       label: 'Tour',       icon: <Calendar size={14} /> },
    { id: 'press',      label: 'Press',      icon: <Newspaper size={14} /> },
    { id: 'media',      label: 'Media',      icon: <ImageIcon size={14} /> },
    { id: 'shop',       label: 'Shop',       icon: <ShoppingBag size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-4">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gold transition-colors"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-gold font-bold">Albasax</p>
              <h1 className="text-3xl font-serif text-white">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Users size={14} />
            <span><span className="text-white font-bold">{subCount}</span> iscritti newsletter</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-gold border-gold'
                  : 'text-gray-600 border-transparent hover:text-gray-400'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════ NEWSLETTER TAB ═══════════════════════ */}
        {activeTab === 'newsletter' && (
          <div className={`grid gap-8 ${showPreview ? 'grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
            <div className="space-y-6">
              <div className="glass border border-gray-800 p-6 space-y-4">
                <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Oggetto email</h2>
                <input placeholder="es. Nuovo singolo in uscita…" value={nlSubject} onChange={e => setNlSubject(e.target.value)}
                  className="w-full bg-transparent text-white text-lg outline-none placeholder:text-gray-700" />
                <input placeholder="Preview text (opzionale)" value={nlPreview} onChange={e => setNlPreview(e.target.value)}
                  className="w-full bg-transparent text-gray-500 text-xs outline-none placeholder:text-gray-800" />
              </div>
              <div className="glass border border-gray-800 p-6">
                <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Contenuto</h2>
                <div className="space-y-0">
                  {blocks.map(block => (
                    <BlockRow key={block.id} block={block}
                      onChange={updated => setBlocks(prev => prev.map(b => b.id === block.id ? updated : b))}
                      onDelete={() => setBlocks(prev => prev.filter(b => b.id !== block.id))}
                      canDelete={blocks.length > 1} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  <p className="w-full text-[10px] uppercase tracking-widest text-gray-700 mb-1">Aggiungi blocco:</p>
                  {([['heading','Titolo'], ['text','Testo'], ['button','Bottone'], ['image','Immagine'], ['divider','Linea'], ['spacer','Spazio']] as [BlockType, string][]).map(([type, label]) => (
                    <button key={type} onClick={() => setBlocks(prev => [...prev, { id: uid(), type, content: '' }])}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-800 text-gray-500 hover:border-gold hover:text-gold text-[10px] uppercase tracking-widest transition-all">
                      <Plus size={10} /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPreview(v => !v)}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-800 text-gray-400 hover:border-gold hover:text-gold text-xs uppercase tracking-widest transition-all">
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPreview ? 'Nascondi' : 'Anteprima'}
                </button>
                <button onClick={handleSendNewsletter} disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50">
                  <Send size={14} />
                  {sending ? 'Invio…' : `Invia a ${subCount} iscritti`}
                </button>
              </div>
              {/* Subscriber list */}
              <div className="glass border border-gray-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Iscritti ({subCount})</h2>
                  <button onClick={() => setShowSubscribers(v => !v)} className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-gold transition-colors">
                    {showSubscribers ? 'Nascondi' : 'Mostra lista'}
                  </button>
                </div>
                {showSubscribers && (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {subscribers.length === 0 && <p className="text-gray-700 text-sm">Nessun iscritto.</p>}
                    {subscribers.map(s => (
                      <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-900 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{s.email}</p>
                          <p className="text-gray-700 text-xs">{s.name || '—'} · {s.active ? <span className="text-green-600">attivo</span> : <span className="text-red-700">inattivo</span>}</p>
                        </div>
                        <button onClick={() => deleteSubscriber(s.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {sendResult && (
                <div className={`p-4 border text-sm ${sendResult.error ? 'border-red-800 bg-red-900/10 text-red-400' : sendResult.dispatching ? 'border-gold/30 bg-gold/5 text-gold' : 'border-green-800 bg-green-900/10 text-green-400'}`}>
                  {sendResult.error ? <p className="flex items-center gap-2"><AlertCircle size={14} />{sendResult.error}</p>
                    : sendResult.dispatching ? (
                      <div className="space-y-2">
                        <p><span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse mr-2" />Invio… <strong>{sendResult.sent}</strong>/{sendResult.total}</p>
                        <div className="w-full bg-black/40 h-1 rounded"><div className="bg-gold h-1 rounded transition-all" style={{ width: sendResult.total ? `${Math.round((sendResult.sent / sendResult.total) * 100)}%` : '0%' }} /></div>
                      </div>
                    ) : <p>✓ Inviata a <strong>{sendResult.sent}</strong>/{sendResult.total} iscritti{sendResult.failed ? ` (${sendResult.failed} falliti)` : ''}.</p>}
                </div>
              )}
            </div>
            {showPreview && (
              <div className="sticky top-24 self-start">
                <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Anteprima</h2>
                <NewsletterPreview subject={nlSubject} blocks={blocks} />
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ MUSIC TAB ═══════════════════════ */}
        {activeTab === 'music' && (
          <div className="space-y-8">
            {/* List */}
            <div className="glass border border-gray-800 p-6">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">Singoli & Album pubblicati ({musicList.length})</h2>
              {musicList.length === 0
                ? <p className="text-gray-700 text-sm">Nessun contenuto in Supabase. Aggiungi il primo qui sotto.</p>
                : <div className="space-y-3">
                  {musicList.map(r => (
                    <div key={r.id} className="flex items-center gap-4 py-3 border-b border-gray-900">
                      {r.cover_url && <img src={r.cover_url} alt="" className="w-12 h-12 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{r.title}</p>
                        <p className="text-gray-600 text-xs">{r.type} · {r.year}</p>
                      </div>
                      {r.spotify_url && <a href={r.spotify_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-400"><ExternalLink size={12} /></a>}
                      <button onClick={() => deleteMusic(r.id)} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>}
            </div>
            {/* Add form */}
            <div className="glass border border-gray-800 p-6 space-y-5">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Aggiungi nuovo singolo / album</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Titolo *"><input className={inp} placeholder="Titolo brano" value={musicForm.title} onChange={e => setMusicForm(f => ({ ...f, title: e.target.value }))} /></Field>
                <Field label="Anno *"><input className={inp} placeholder="2024" value={musicForm.year} onChange={e => setMusicForm(f => ({ ...f, year: e.target.value }))} /></Field>
                <Field label="Tipo">
                  <select className={sel} value={musicForm.type} onChange={e => setMusicForm(f => ({ ...f, type: e.target.value }))}>
                    <option>Single</option><option>EP</option><option>Album</option>
                  </select>
                </Field>
              </div>
              <Field label="Cover (file o URL)"><ImageUpload value={musicForm.cover_url} onChange={url => setMusicForm(f => ({ ...f, cover_url: url }))} bucket="newsletter-images" /></Field>
              <Field label="Link Spotify"><input className={inp} placeholder="https://open.spotify.com/…" value={musicForm.spotify_url} onChange={e => setMusicForm(f => ({ ...f, spotify_url: e.target.value }))} /></Field>
              <Field label="Link Apple Music"><input className={inp} placeholder="https://music.apple.com/…" value={musicForm.apple_url} onChange={e => setMusicForm(f => ({ ...f, apple_url: e.target.value }))} /></Field>
              <button onClick={saveMusic} disabled={musicSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50">
                {musicSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {musicSaving ? 'Salvataggio…' : 'Aggiungi'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════ TOUR TAB ═══════════════════════ */}
        {activeTab === 'tour' && (
          <div className="space-y-8">
            <div className="glass border border-gray-800 p-6">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">Date tour ({tourList.length})</h2>
              {tourList.length === 0
                ? <p className="text-gray-700 text-sm">Nessuna data in Supabase.</p>
                : <div className="space-y-3">
                  {tourList.map(r => (
                    <div key={r.id} className="flex items-center gap-4 py-3 border-b border-gray-900">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{r.venue} — <span className="text-gray-400">{r.location}</span></p>
                        <p className="text-gray-600 text-xs">{new Date(r.date).toLocaleDateString('it-IT')} · <span className={r.status === 'Available' ? 'text-green-500' : r.status === 'Sold Out' ? 'text-yellow-500' : 'text-red-500'}>{r.status}</span></p>
                      </div>
                      {r.ticket_url && <a href={r.ticket_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold"><ExternalLink size={12} /></a>}
                      <button onClick={() => deleteTour(r.id)} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>}
            </div>
            <div className="glass border border-gray-800 p-6 space-y-5">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Aggiungi nuova data</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Data *"><input type="date" className={inp} value={tourForm.date} onChange={e => setTourForm(f => ({ ...f, date: e.target.value }))} /></Field>
                <Field label="Status">
                  <select className={sel} value={tourForm.status} onChange={e => setTourForm(f => ({ ...f, status: e.target.value }))}>
                    <option>Available</option><option>Sold Out</option><option>Canceled</option>
                  </select>
                </Field>
                <Field label="Venue *"><input className={inp} placeholder="es. Alcatraz" value={tourForm.venue} onChange={e => setTourForm(f => ({ ...f, venue: e.target.value }))} /></Field>
                <Field label="Città / Location *"><input className={inp} placeholder="es. Milano, IT" value={tourForm.location} onChange={e => setTourForm(f => ({ ...f, location: e.target.value }))} /></Field>
              </div>
              <Field label="Link biglietti"><input className={inp} placeholder="https://ticketone.it/…" value={tourForm.ticket_url} onChange={e => setTourForm(f => ({ ...f, ticket_url: e.target.value }))} /></Field>
              <button onClick={saveTour} disabled={tourSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50">
                {tourSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {tourSaving ? 'Salvataggio…' : 'Aggiungi data'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════ PRESS TAB ═══════════════════════ */}
        {activeTab === 'press' && (
          <div className="space-y-8">
            <div className="glass border border-gray-800 p-6">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">Articoli press ({pressList.length})</h2>
              {pressList.length === 0
                ? <p className="text-gray-700 text-sm">Nessun articolo in Supabase.</p>
                : <div className="space-y-3">
                  {pressList.map(r => (
                    <div key={r.id} className="flex items-center gap-4 py-3 border-b border-gray-900">
                      {r.image_url && <img src={r.image_url} alt="" className="w-16 h-12 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-1">{r.title}</p>
                        <p className="text-gray-600 text-xs">{r.outlet} · {r.date}</p>
                      </div>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold"><ExternalLink size={12} /></a>
                      <button onClick={() => deletePress(r.id)} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>}
            </div>
            <div className="glass border border-gray-800 p-6 space-y-5">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Aggiungi articolo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Outlet *"><input className={inp} placeholder="es. Panorama" value={pressForm.outlet} onChange={e => setPressForm(f => ({ ...f, outlet: e.target.value }))} /></Field>
                <Field label="Data"><input className={inp} placeholder="es. March 20, 2023" value={pressForm.date} onChange={e => setPressForm(f => ({ ...f, date: e.target.value }))} /></Field>
              </div>
              <Field label="Titolo *"><input className={inp} placeholder="Titolo articolo" value={pressForm.title} onChange={e => setPressForm(f => ({ ...f, title: e.target.value }))} /></Field>
              <Field label="Excerpt (breve descrizione)"><textarea className={`${inp} resize-none`} rows={2} placeholder="Breve estratto dell'articolo…" value={pressForm.excerpt} onChange={e => setPressForm(f => ({ ...f, excerpt: e.target.value }))} /></Field>
              <Field label="Immagine (file o URL)"><ImageUpload value={pressForm.image_url} onChange={url => setPressForm(f => ({ ...f, image_url: url }))} bucket="newsletter-images" /></Field>
              <Field label="URL articolo *"><input className={inp} placeholder="https://…" value={pressForm.url} onChange={e => setPressForm(f => ({ ...f, url: e.target.value }))} /></Field>
              <button onClick={savePress} disabled={pressSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50">
                {pressSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {pressSaving ? 'Salvataggio…' : 'Aggiungi articolo'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════ MEDIA TAB ═══════════════════════ */}
        {activeTab === 'media' && (
          <div className="space-y-8">
            <div className="glass border border-gray-800 p-6">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">Galleria media ({mediaList.length})</h2>
              {mediaList.length === 0
                ? <p className="text-gray-700 text-sm">Nessun contenuto in Supabase.</p>
                : <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {mediaList.map(r => (
                    <div key={r.id} className="relative group">
                      <img src={r.thumbnail || r.url} alt={r.title} className="w-full aspect-square object-cover rounded" />
                      {r.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded"><Eye size={16} className="text-white" /></div>}
                      <button onClick={() => deleteMedia(r.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/70 p-1 rounded text-red-400 hover:text-red-300 transition-all">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>}
            </div>
            <div className="glass border border-gray-800 p-6 space-y-5">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Aggiungi foto / video</h2>
              <Field label="Tipo">
                <select className={sel} value={mediaForm.type} onChange={e => setMediaForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="image">Immagine</option><option value="video">Video</option>
                </select>
              </Field>
              <Field label={mediaForm.type === 'image' ? 'Immagine (file o URL) *' : 'Video (URL file .mp4) *'}>
                <ImageUpload value={mediaForm.url} onChange={url => setMediaForm(f => ({ ...f, url }))} bucket="newsletter-images" />
              </Field>
              {mediaForm.type === 'video' && (
                <Field label="Thumbnail (immagine anteprima)"><ImageUpload value={mediaForm.thumbnail} onChange={url => setMediaForm(f => ({ ...f, thumbnail: url }))} bucket="newsletter-images" /></Field>
              )}
              <Field label="Titolo (facoltativo)"><input className={inp} placeholder="es. Live performance" value={mediaForm.title} onChange={e => setMediaForm(f => ({ ...f, title: e.target.value }))} /></Field>
              <button onClick={saveMedia} disabled={mediaSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50">
                {mediaSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {mediaSaving ? 'Salvataggio…' : 'Aggiungi alla galleria'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════ SHOP TAB ═══════════════════════ */}
        {activeTab === 'shop' && (
          <div className="space-y-8">
            <div className="glass border border-gray-800 p-6">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">Prodotti shop ({shopList.length})</h2>
              {shopList.length === 0
                ? <p className="text-gray-700 text-sm">Nessun prodotto in Supabase.</p>
                : <div className="space-y-3">
                  {shopList.map(r => (
                    <div key={r.id} className="flex items-center gap-4 py-3 border-b border-gray-900">
                      {r.image_url && <img src={r.image_url} alt="" className="w-12 h-12 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{r.name}</p>
                        <p className="text-gray-600 text-xs">€{Number(r.price).toFixed(2)} · {r.category} · stock: {r.stock}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 border ${r.active ? 'border-green-800 text-green-500' : 'border-gray-800 text-gray-600'}`}>{r.active ? 'Attivo' : 'Nascosto'}</span>
                      <button onClick={() => deleteShop(r.id)} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>}
            </div>
            <div className="glass border border-gray-800 p-6 space-y-5">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Aggiungi prodotto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome *"><input className={inp} placeholder="es. Albasax T-Shirt" value={shopForm.name} onChange={e => setShopForm(f => ({ ...f, name: e.target.value }))} /></Field>
                <Field label="Prezzo (€) *"><input type="number" step="0.01" className={inp} placeholder="29.99" value={shopForm.price} onChange={e => setShopForm(f => ({ ...f, price: e.target.value }))} /></Field>
                <Field label="Categoria">
                  <select className={sel} value={shopForm.category} onChange={e => setShopForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="vinyl">Vinyl</option><option value="apparel">Apparel</option><option value="limited">Limited Edition</option>
                  </select>
                </Field>
                <Field label="Stock"><input type="number" className={inp} placeholder="0" value={shopForm.stock} onChange={e => setShopForm(f => ({ ...f, stock: e.target.value }))} /></Field>
              </div>
              <Field label="Descrizione"><textarea className={`${inp} resize-none`} rows={2} placeholder="Descrizione prodotto…" value={shopForm.description} onChange={e => setShopForm(f => ({ ...f, description: e.target.value }))} /></Field>
              <Field label="Immagine (file o URL)"><ImageUpload value={shopForm.image_url} onChange={url => setShopForm(f => ({ ...f, image_url: url }))} bucket="newsletter-images" /></Field>
              <Field label="Stripe Price ID (per checkout)"><input className={inp} placeholder="price_1ABC…" value={shopForm.stripe_price_id} onChange={e => setShopForm(f => ({ ...f, stripe_price_id: e.target.value }))} /></Field>
              <button onClick={saveShop} disabled={shopSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50">
                {shopSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {shopSaving ? 'Salvataggio…' : 'Aggiungi prodotto'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
