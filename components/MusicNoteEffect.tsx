import React, { useState, useCallback } from 'react';

interface Note {
  id: number;
  x: number;
  symbol: string;
}

interface MusicNoteEffectProps {
  children: React.ReactNode;
  className?: string;
}

const MusicNoteEffect: React.FC<MusicNoteEffectProps> = ({ children, className = '' }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteId, setNoteId] = useState(0);

  const musicSymbols = ['♪', '♫', '♩', '♬', '🎵', '🎶'];

  const createNote = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const newNote: Note = {
      id: noteId,
      x: x,
      symbol: musicSymbols[Math.floor(Math.random() * musicSymbols.length)],
    };

    setNotes(prev => [...prev, newNote]);
    setNoteId(prev => prev + 1);

    // Rimuovi la nota dopo l'animazione
    setTimeout(() => {
      setNotes(prev => prev.filter(note => note.id !== newNote.id));
    }, 1000);
  }, [noteId]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Crea una nota ogni tanto (non ad ogni movimento)
    if (Math.random() > 0.85) {
      createNote(e);
    }
  }, [createNote]);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={createNote}
    >
      {children}
      {notes.map(note => (
        <span
          key={note.id}
          className="absolute pointer-events-none text-gold animate-float-up"
          style={{
            left: `${note.x}px`,
            bottom: '100%',
            fontSize: '14px',
          }}
        >
          {note.symbol}
        </span>
      ))}
    </div>
  );
};

export default MusicNoteEffect;
