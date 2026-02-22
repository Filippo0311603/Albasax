import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Lock, Plus, Trash2, Eye, EyeOff, Users, ArrowLeft, Image, Type, Link as LinkIcon, AlertCircle } from 'lucide-react';

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
      return `<h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#ffffff;line-height:1.3;">${block.content}</h2>`;
    case 'text':
      return `<p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#9ca3af;">${block.content.replace(/\n/g, '<br>')}</p>`;
    case 'button':
      return `<div style="text-align:center;margin:28px 0;"><a href="${block.href || '#'}" style="display:inline-block;padding:14px 40px;background:#c5a643;color:#000000;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.25em;text-decoration:none;">${block.content}</a></div>`;
    case 'image':
      return `<div style="margin:24px 0;"><img src="${block.content}" alt="" style="width:100%;max-width:100%;display:block;"></div>`;
    case 'divider':
      return `<hr style="border:none;border-top:1px solid #1f1f1f;margin:28px 0;">`;
    case 'spacer':
      return `<div style="height:24px;"></div>`;
    default:
      return '';
  }
}

function blocksToHtml(blocks: Block[]): string {
  return blocks.map(blockToHtml).join('\n');
}

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
          <input
            className={`${base} text-blue-400 text-xs`}
            placeholder="URL immagine (es. https://albasax.com/foto.jpg)"
            value={block.content}
            onChange={e => onChange({ ...block, content: e.target.value })}
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
  <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded text-sm overflow-auto max-h-[70vh]">
    <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Oggetto email:</p>
    <p className="text-white font-semibold mb-6">{subject || '—'}</p>

    {/* Simulated email */}
    <div style={{ background: '#111111', border: '1px solid #1f1f1f', maxWidth: 540, margin: '0 auto' }}>
      <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid #1f1f1f', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5a643', fontWeight: 'bold' }}>ALBASAX</p>
      </div>
      <div style={{ padding: '36px 36px 28px' }}>
        <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: 12 }}>Ciao [nome],</p>
        {blocks.map(block => {
          if (block.type === 'heading') return <h2 key={block.id} style={{ margin: '0 0 16px', fontFamily: 'Georgia,serif', fontSize: 22, color: '#ffffff', lineHeight: 1.3 }}>{block.content || <em style={{ color: '#333' }}>Titolo…</em>}</h2>;
          if (block.type === 'text')    return <p key={block.id} style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.8, color: '#9ca3af', whiteSpace: 'pre-wrap' }}>{block.content || <em style={{ color: '#333' }}>Testo…</em>}</p>;
          if (block.type === 'button')  return (
            <div key={block.id} style={{ textAlign: 'center', margin: '20px 0' }}>
              <span style={{ display: 'inline-block', padding: '11px 32px', background: '#c5a643', color: '#000', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                {block.content || 'Bottone'}
              </span>
            </div>
          );
          if (block.type === 'image')   return block.content ? <img key={block.id} src={block.content} alt="" style={{ width: '100%', margin: '16px 0', display: 'block' }} /> : <div key={block.id} style={{ background: '#1a1a1a', height: 80, margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#333', fontSize: 11 }}>Immagine</span></div>;
          if (block.type === 'divider') return <hr key={block.id} style={{ border: 'none', borderTop: '1px solid #1f1f1f', margin: '20px 0' }} />;
          if (block.type === 'spacer')  return <div key={block.id} style={{ height: 20 }} />;
          return null;
        })}
      </div>
      <div style={{ padding: '20px 32px', borderTop: '1px solid #1f1f1f', textAlign: 'center' }}>
        <p style={{ margin: '0 0 6px', fontSize: 9, color: '#4b5563', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Albasax Music — Official Newsletter</p>
        <p style={{ margin: 0, fontSize: 9, color: '#374151' }}>Non vuoi più ricevere questa newsletter? <span style={{ color: '#c5a643' }}>Disiscriviti</span></p>
      </div>
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
  const [result, setResult]       = useState<{ sent?: number; total?: number; failed?: number; error?: string } | null>(null);

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
      setResult(data);
    } catch {
      setResult({ error: 'Errore di rete. Riprova.' });
    } finally {
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
              <div className={`p-4 border text-sm ${result.error ? 'border-red-800 bg-red-900/10 text-red-400' : 'border-green-800 bg-green-900/10 text-green-400'}`}>
                {result.error
                  ? <p className="flex items-center gap-2"><AlertCircle size={14} />{result.error}</p>
                  : <p>✓ Inviata a <strong>{result.sent}</strong>/{result.total} iscritti{result.failed ? ` (${result.failed} falliti, vedi log server)` : ''}.</p>
                }
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
