
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';

const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Hello! I'm Albasax's virtual assistant. Ask me anything about the new album, tour dates, or my musical inspirations." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the personal assistant for the musical artist Albasax. 
        About Albasax: They play saxophone, fuse jazz with electronic/ambient, new album "Midnight Echoes" is out now.
        Upcoming tour includes London, Paris, Milan, NYC.
        Style: Professional, artistic, sophisticated, and English-only.
        
        Question: ${userMsg}`,
        config: {
          temperature: 0.7,
          maxOutputTokens: 250,
          systemInstruction: "Always speak in English. Be polite, artistic, and concise."
        }
      });

      const reply = response.text || "I apologize, the connection to the soundboard seems weak. Please try again.";
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to the network right now. Please check back later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center space-x-2 animate-bounce"
        >
          <Sparkles size={24} />
          <span className="hidden md:inline font-bold uppercase tracking-widest text-xs">Ask Albasax AI</span>
        </button>
      ) : (
        <div className="glass w-[90vw] md:w-96 h-[500px] flex flex-col shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300 rounded-lg">
          <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-serif text-sm">Albasax AI</h3>
                <span className="text-[10px] text-green-500 uppercase tracking-widest">Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </header>

          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-yellow-600/20 border border-yellow-600/30 text-white rounded-l-lg rounded-tr-lg' 
                    : 'bg-gray-800/50 text-gray-300 rounded-r-lg rounded-tl-lg'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 p-3 rounded-r-lg rounded-tl-lg">
                  <Loader2 className="animate-spin text-yellow-600" size={16} />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800 bg-black/50">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex space-x-2"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-grow bg-transparent border border-gray-800 rounded-sm px-4 py-2 text-sm outline-none focus:border-yellow-600 transition-all"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-yellow-600 text-white p-2 rounded-sm hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiChat;
