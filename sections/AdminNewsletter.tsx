import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Lock, Plus, Trash2, Eye, EyeOff, Users, ArrowLeft, Image, Type, Link as LinkIcon, AlertCircle, Upload, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

// ─── Block types ─────────────────────────────────────────────────────────────
type BlockType = 'heading' | 'text' | 'button' | 'image' | 'divider' | 'spacer';

interface Block {
  id: string;
  type: BlockType;
  content: string;   // testo, url immagine, label bottone
  href?: string;     // solo per bottone
}

const defaultBlocks = (): Block[] => [
  { id: '1', type: 'heading', content: '' },
  { id: '2', type: 'text',    content: '' },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Render block → HTML email ───────────────────────────────────────────────
function blockToHtml(block: Block): string {
  switch (block.type) {
    case 'heading':
      return `<h2 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#ffffff;line-height:1.25;letter-spacing:-0.01em;">${block.content}</h2>`;
    case 'text':
      return `<p style="margin:0 0 20px;font-size:15px;line-height:1.85;color:#9ca3af;font-weight:300;">${block.content.replace(/\n/g, '<br>')}</p>`;
    case 'button':
      return `<div style="text-align:center;margin:36px 0;"><a href="${block.href || '#'}" style="display:inline-block;padding:16px 48px;background:transparent;color:#c5a643;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.35em;text-decoration:none;border:1px solid #c5a643;">${block.content}</a></div>`;
    case 'image':
      return `<div style="margin:28px 0;"><img src="${block.content}" alt="" style="width:100%;max-width:100%;display:block;"></div>`;
    case 'divider':
      return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;"><tr><td style="background:linear-gradient(90deg,transparent,#2a2a2a,transparent);height:1px;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
    case 'spacer':
      return `<div style="height:32px;"></div>`;
    default:
      return '';
  }
}

function blocksToHtml(blocks: Block[]): string {
  return blocks.map(blockToHtml).join('\n');
}

// ─── Image Upload Block ───────────────────────────────────────────────────────
const ImageUploadBlock: React.FC<{
  value: string;
  onChange: (url: string) => void;
  base: string;
}> = ({ value, onChange, base }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('newsletter-images')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from('newsletter-images').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-all disabled:opacity-50"
        >
          {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? 'Caricamento…' : 'Carica file'}
        </button>
        <span className="text-gray-700 text-xs">oppure</span>
        <input
          className={`${base} text-blue-400 text-xs flex-1`}
          placeholder="incolla URL immagine"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {value && <img src={value} alt="preview" className="max-h-32 rounded border border-gray-800 object-contain" />}
    </div>
  );
};

// ─── Block Editor Row ─────────────────────────────────────────────────────────
const BlockRow: React.FC<{
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  canDelete: boolean;
}> = ({ block, onChange, onDelete, canDelete }) => {
  const base = 'w-full bg-transparent text-white text-sm outline-none resize-none placeholder:text-gray-700';

  return (
    <div className="group flex gap-3 items-start py-3 border-b border-gray-900">
      {/* Type badge */}
      <span className="mt-1 text-[9px] uppercase tracking-widest text-gray-700 w-14 flex-shrink-0 pt-1">{block.type}</span>

      {/* Editor */}
      <div className="flex-1 space-y-2">
        {block.type === 'heading' && (
          <input
            className={`${base} text-xl font-serif`}
            placeholder="Scrivi il titolo dell'email…"
            value={block.content}
            onChange={e => onChange({ ...block, content: e.target.value })}
          />
        )}
        {block.type === 'text' && (
          <textarea
            rows={3}
            className={`${base} leading-relaxed`}
            placeholder="Scrivi il testo del paragrafo…"
            value={block.content}
            onChange={e => onChange({ ...block, content: e.target.value })}
          />
        )}
        {block.type === 'button' && (
          <div className="space-y-2">
            <input
              className={base}
              placeholder="Testo del bottone (es. Ascolta ora)"
              value={block.content}
              onChange={e => onChange({ ...block, content: e.target.value })}
            />
            <input
              className={`${base} text-gold text-xs`}
              placeholder="URL (es. https://open.spotify.com/…)"
              value={block.href || ''}
              onChange={e => onChange({ ...block, href: e.target.value })}
            />
          </div>
        )}
        {block.type === 'image' && (
          <ImageUploadBlock
            value={block.content}
            onChange={url => onChange({ ...block, content: url })}
            base={base}
          />
        )}
        {(block.type === 'divider' || block.type === 'spacer') && (
          <p className="text-gray-700 text-xs italic">{block.type === 'divider' ? '── linea separatrice ──' : '── spazio vuoto ──'}</p>
        )}
      </div>

      {/* Delete */}
      {canDelete && (
        <button
          onClick={onDelete}
          className="mt-1 opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

// ─── Preview panel ────────────────────────────────────────────────────────────
const Preview: React.FC<{ subject: string; blocks: Block[] }> = ({ subject, blocks }) => (
  <div className="bg-[#080808] border border-gray-900 p-4 rounded text-sm overflow-auto max-h-[75vh]">
    <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Oggetto email:</p>
    <p className="text-white font-semibold mb-5">{subject || '—'}</p>

    {/* Simulated email */}
    <div style={{ maxWidth: 540, margin: '0 auto', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
      {/* Top gold line */}
      <div style={{ background: 'linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a)', height: 2 }} />
      {/* Header */}
      <div style={{ background: '#0f0f0f', padding: '28px 32px 22px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 4px', fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#c5a643', fontWeight: 700 }}>— ALBASAX —</p>
        <p style={{ margin: 0, fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#4b4b4b' }}>Official Newsletter</p>
      </div>
      <div style={{ background: '#1a1a1a', height: 1 }} />
      {/* Greeting */}
      <div style={{ background: '#0f0f0f', padding: '20px 36px 0' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6b6b6b' }}>Ciao <span style={{ color: '#c5a643', fontWeight: 600 }}>[nome]</span>,</p>
      </div>
      {/* Body */}
      <div style={{ background: '#0f0f0f', padding: '20px 36px 32px' }}>
        {blocks.map(block => {
          if (block.type === 'heading') return <h2 key={block.id} style={{ margin: '0 0 18px', fontFamily: "Georgia,'Times New Roman',serif", fontSize: 24, fontWeight: 400, color: '#ffffff', lineHeight: 1.25 }}>{block.content || <em style={{ color: '#333' }}>Titolo…</em>}</h2>;
          if (block.type === 'text')    return <p key={block.id} style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.85, color: '#9ca3af', fontWeight: 300, whiteSpace: 'pre-wrap' }}>{block.content || <em style={{ color: '#333' }}>Testo…</em>}</p>;
          if (block.type === 'button')  return (
            <div key={block.id} style={{ textAlign: 'center', margin: '28px 0' }}>
              <span style={{ display: 'inline-block', padding: '13px 36px', background: 'transparent', color: '#c5a643', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35em', border: '1px solid #c5a643' }}>
                {block.content || 'Bottone'}
              </span>
            </div>
          );
          if (block.type === 'image')   return block.content ? <img key={block.id} src={block.content} alt="" style={{ width: '100%', margin: '20px 0', display: 'block' }} /> : <div key={block.id} style={{ background: '#1a1a1a', height: 80, margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#333', fontSize: 11 }}>Immagine</span></div>;
          if (block.type === 'divider') return <div key={block.id} style={{ background: 'linear-gradient(90deg,transparent,#2a2a2a,transparent)', height: 1, margin: '24px 0' }} />;
          if (block.type === 'spacer')  return <div key={block.id} style={{ height: 24 }} />;
          return null;
        })}
      </div>
      {/* Divider */}
      <div style={{ background: 'linear-gradient(90deg,transparent,#1f1f1f,transparent)', height: 1 }} />
      {/* Footer */}
      <div style={{ background: '#0a0a0a', padding: '24px 32px 28px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 3px', fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#c5a643', fontWeight: 600 }}>ALBASAX</p>
        <p style={{ margin: '0 0 14px', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#333' }}>Music • Official Newsletter</p>
        <p style={{ margin: 0, fontSize: 8, color: '#2a2a2a' }}>
          <span style={{ color: '#3a3a3a' }}>Disiscriviti</span> &nbsp;•&nbsp; <span style={{ color: '#3a3a3a' }}>Privacy Policy</span>
        </p>
      </div>
      {/* Bottom gold line */}
      <div style={{ background: 'linear-gradient(90deg,#6b4e0a,#c5a643,#f0d07a,#c5a643,#6b4e0a)', height: 2 }} />
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AdminNewsletter: React.FC = () => {
  const navigate = useNavigate();
  const [secret, setSecret]       = useState('');
  const [authed, setAuthed]       = useState(false);
  const [authErr, setAuthErr]     = useState('');

  const [subject, setSubject]       = useState('');
  const [preview, setPreviewText]   = useState('');
  const [blocks, setBlocks]         = useState<Block[]>(defaultBlocks());
  const [showPreview, setShowPreview] = useState(false);

  const [subCount, setSubCount]   = useState<number | null>(null);
  const [sending, setSending]     = useState(false);
  const [result, setResult]       = useState<{ sent?: number; total?: number; failed?: number; error?: string; dispatching?: boolean; done?: boolean; failedList?: { email: string; reason: string }[] } | null>(null);

  // Verify secret and load subscriber count
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErr('');
    const res = await fetch(`${SERVER_URL}/api/admin/subscribers`, {
      headers: { 'x-admin-secret': secret },
    }).catch(() => null);
    if (!res || !res.ok) { setAuthErr('Password errata o server non raggiungibile.'); return; }
    const data = await res.json();
    setSubCount(data.count ?? 0);
    setAuthed(true);
  };

  const updateBlock = (id: string, updated: Block) =>
    setBlocks(prev => prev.map(b => b.id === id ? updated : b));

  const deleteBlock = (id: string) =>
    setBlocks(prev => prev.filter(b => b.id !== id));

  const addBlock = (type: BlockType) =>
    setBlocks(prev => [...prev, { id: uid(), type, content: '' }]);

  const handleSend = async () => {
    if (!subject.trim()) { setResult({ error: 'Inserisci l\'oggetto dell\'email.' }); return; }
    const htmlBody = blocksToHtml(blocks);
    if (!htmlBody.trim()) { setResult({ error: 'Aggiungi almeno un blocco di testo.' }); return; }

    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/send-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ subject: subject.trim(), html: htmlBody, previewText: preview.trim() }),
      });
      const data = await res.json();

      if (data.error) {
        setResult({ error: data.error });
        setSending(false);
        return;
      }

      // Invio asincrono: polling fino a done
      if (data.dispatching && data.jobId) {
        setResult({ dispatching: true, total: data.total, sent: 0, failed: 0, done: false });
        const jobId = data.jobId;
        const poll = setInterval(async () => {
          try {
            const statusRes = await fetch(`${SERVER_URL}/api/admin/newsletter-status/${jobId}`, {
              headers: { 'x-admin-secret': secret },
            });
            const status = await statusRes.json();
            setResult({ dispatching: !status.done, ...status });
            if (status.done) {
              clearInterval(poll);
              setSending(false);
            }
          } catch {
            // ignora errori di polling temporanei
          }
        }, 3000);
      } else {
        setResult(data);
        setSending(false);
      }
    } catch {
      setResult({ error: 'Errore di rete. Riprova.' });
      setSending(false);
    }
  };

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass border border-gray-800 p-10 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-[10px] tracking-widest uppercase text-gold font-bold">Albasax</p>
          <h1 className="text-3xl font-serif text-white">Admin Newsletter</h1>
          <p className="text-gray-600 text-xs">Accesso riservato</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="password"
              placeholder="Password admin"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-800 pl-9 pr-4 py-3 text-sm text-white outline-none focus:border-gold transition-all"
            />
          </div>
          {authErr && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{authErr}</p>}
          <button type="submit" className="w-full py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all">
            Accedi
          </button>
        </form>
      </div>
    </div>
  );

  // ── Main editor ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gold transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-gold font-bold">Admin</p>
              <h1 className="text-3xl font-serif text-white">Invia Newsletter</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Users size={14} />
            <span><span className="text-white font-bold">{subCount}</span> iscritti attivi</span>
          </div>
        </div>

        <div className={`grid gap-8 ${showPreview ? 'grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>

          {/* ── LEFT: Composer ── */}
          <div className="space-y-6">
            {/* Subject */}
            <div className="glass border border-gray-800 p-6 space-y-4">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Oggetto email</h2>
              <input
                placeholder="es. Nuovo singolo in uscita tra 10 giorni 🎷"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-transparent text-white text-lg outline-none placeholder:text-gray-700"
              />
              <input
                placeholder="Preview text (opzionale — testo che appare accanto all'oggetto)"
                value={preview}
                onChange={e => setPreviewText(e.target.value)}
                className="w-full bg-transparent text-gray-500 text-xs outline-none placeholder:text-gray-800"
              />
            </div>

            {/* Blocks */}
            <div className="glass border border-gray-800 p-6">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Contenuto</h2>
              <div className="space-y-0">
                {blocks.map(block => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    onChange={updated => updateBlock(block.id, updated)}
                    onDelete={() => deleteBlock(block.id)}
                    canDelete={blocks.length > 1}
                  />
                ))}
              </div>

              {/* Add block buttons */}
              <div className="flex flex-wrap gap-2 mt-6">
                <p className="w-full text-[10px] uppercase tracking-widest text-gray-700 mb-1">Aggiungi blocco:</p>
                {[
                  { type: 'heading' as BlockType, icon: <Type size={12} />, label: 'Titolo' },
                  { type: 'text'    as BlockType, icon: <Type size={12} />, label: 'Testo' },
                  { type: 'button'  as BlockType, icon: <LinkIcon size={12} />, label: 'Bottone link' },
                  { type: 'image'   as BlockType, icon: <Image size={12} />, label: 'Immagine' },
                  { type: 'divider' as BlockType, icon: <Plus size={12} />, label: 'Linea' },
                  { type: 'spacer'  as BlockType, icon: <Plus size={12} />, label: 'Spazio' },
                ].map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-800 text-gray-500 hover:border-gold hover:text-gold text-[10px] uppercase tracking-widest transition-all"
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(v => !v)}
                className="flex items-center gap-2 px-5 py-3 border border-gray-800 text-gray-400 hover:border-gold hover:text-gold text-xs uppercase tracking-widest transition-all"
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? 'Nascondi preview' : 'Anteprima'}
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50"
              >
                <Send size={14} />
                {sending ? 'Invio in corso…' : `Invia a ${subCount} iscritti`}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`p-4 border text-sm ${
                result.error ? 'border-red-800 bg-red-900/10 text-red-400'
                : result.dispatching ? 'border-gold/30 bg-gold/5 text-gold'
                : 'border-green-800 bg-green-900/10 text-green-400'
              }`}>
                {result.error ? (
                  <p className="flex items-center gap-2"><AlertCircle size={14} />{result.error}</p>
                ) : result.dispatching ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse" />
                      Invio in corso… <strong>{result.sent}</strong>/{result.total} email consegnate
                    </p>
                    <div className="w-full bg-black/40 h-1 rounded">
                      <div className="bg-gold h-1 rounded transition-all duration-500" style={{ width: result.total ? `${Math.round((result.sent / result.total) * 100)}%` : '0%' }} />
                    </div>
                    <p className="text-[10px] text-gold/50">La pagina può essere chiusa — l'invio continua sul server.</p>
                  </div>
                ) : (
                  <div>
                    <p>✓ Inviata a <strong>{result.sent}</strong>/{result.total} iscritti{result.failed ? ` (${result.failed} falliti)` : ''}.</p>
                    {result.failedList && result.failedList.length > 0 && (
                      <ul className="mt-2 text-xs text-red-400 space-y-0.5">
                        {result.failedList.map((f: { email: string; reason: string }, i: number) => (
                          <li key={i}>✗ {f.email} — {f.reason}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Preview ── */}
          {showPreview && (
            <div className="sticky top-24 self-start">
              <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Anteprima</h2>
              <Preview subject={subject} blocks={blocks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
