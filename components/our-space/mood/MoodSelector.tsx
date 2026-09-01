'use client';

import { useEffect, useRef, useState } from 'react';
import { Mood, moodValues } from '@/lib/couple-space/validation';
import { Button } from '@/components/ui/Button';

const moodLabels: Record<Mood, string> = { GREAT: 'Great', GOOD: 'Good', MEH: 'Meh', SAD: 'Sad', FRUSTRATED: 'Frustrated', MISSING_YOU: 'Missing you' };
const moodGifPaths: Record<Mood, string> = { GREAT: '/moods/great.gif', GOOD: '/moods/good.gif', MEH: '/moods/meh.gif', SAD: '/moods/sad.gif', FRUSTRATED: '/moods/frustrated.gif', MISSING_YOU: '/moods/missing-you.gif' };
interface MoodSelectorProps { currentMood: Mood | null; onSelect: (mood: Mood) => Promise<boolean>; onClose: () => void; }

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
        <header className="mood-dialog-header"><div><p className="section-kicker">Shared status</p><h2 id="mood-selector-title">How are you feeling?</h2></div><Button variant="ghost" size="sm" onClick={onClose} aria-label="Close mood selector">Close</Button></header>
        <div className="mood-options" role="radiogroup" aria-label="Select your mood">
          {moodValues.map((mood) => { const selected = selectedMood === mood; return <button key={mood} type="button" role="radio" aria-checked={selected} className={`mood-option${selected ? ' is-selected' : ''}`} onClick={async () => { const saved = await onSelect(mood); if (saved) { setSelectedMood(mood); onClose(); } }}><span className="mood-gif-wrap mood-option-gif"><img src={moodGifPaths[mood]} alt="" /></span><span>{moodLabels[mood]}</span></button>; })}
        </div>
        <Button variant="ghost" onClick={onClose} className="mood-cancel">Cancel</Button>
      </div>
    </div>
  );
}
