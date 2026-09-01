'use client';

import { useEffect, useRef, useState } from 'react';
import { Mood, moodValues } from '@/lib/couple-space/validation';
import { Button } from '@/components/ui/Button';

const moodLabels: Record<Mood, { emoji: string; label: string }> = {
  GREAT: { emoji: '🙂', label: 'Great' }, GOOD: { emoji: '😊', label: 'Good' },
  MEH: { emoji: '😐', label: 'Meh' }, SAD: { emoji: '😔', label: 'Sad' },
  FRUSTRATED: { emoji: '😤', label: 'Frustrated' }, MISSING_YOU: { emoji: '♥', label: 'Missing you' },
};

interface MoodSelectorProps { currentMood: Mood | null; onSelect: (mood: Mood) => void; onClose: () => void; }

export default function MoodSelector({ currentMood, onSelect, onClose }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(currentMood);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div className="mood-overlay" role="dialog" aria-modal="true" aria-labelledby="mood-selector-title" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} tabIndex={-1} className="mood-dialog">
        <header className="mood-dialog-header"><div><p className="section-kicker">Shared status</p><h2 id="mood-selector-title">How are you feeling?</h2></div><Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">Close</Button></header>
        <div className="mood-options" role="radiogroup" aria-label="Select your mood">
          {moodValues.map((mood) => { const selected = selectedMood === mood; return <button key={mood} type="button" role="radio" aria-checked={selected} className={`mood-option${selected ? ' is-selected' : ''}`} onClick={() => { setSelectedMood(mood); onSelect(mood); onClose(); }}><span className="mood-option-emoji" aria-hidden="true">{moodLabels[mood].emoji}</span><span>{moodLabels[mood].label}</span></button>; })}
        </div>
        <Button variant="ghost" onClick={onClose} className="mood-cancel">Cancel</Button>
      </div>
    </div>
  );
}
