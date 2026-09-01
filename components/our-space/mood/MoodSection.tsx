'use client';

import { useState } from 'react';
import MoodCard from './MoodCard';
import MoodSelector from './MoodSelector';
import { MoodPairView } from '@/lib/couple-space/mood';
import { Mood } from '@/lib/couple-space/validation';

interface MoodSectionProps { moods: MoodPairView; currentUserName: string; partnerName: string | null; }

export default function MoodSection({ moods, currentUserName, partnerName }: MoodSectionProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [currentMoods, setCurrentMoods] = useState(moods);
  const [saveError, setSaveError] = useState('');

  const handleMoodSelect = async (mood: Mood): Promise<boolean> => {
    try {
      const response = await fetch('/api/mood', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood }) });
      const data = (await response.json()) as { ok?: boolean; error?: string; mood?: MoodPairView['me'] };
      if (!response.ok || !data.ok || !data.mood) { setSaveError(data.error || 'Could not update your mood. Try again.'); return false; }
      setCurrentMoods((previous) => ({ ...previous, me: data.mood ?? previous.me }));
      setSaveError('');
      return true;
    } catch { setSaveError('Could not update your mood. Try again.'); return false; }
  };

  const me = currentMoods.me;
  const partner = currentMoods.partner;
  return (
    <section className="w-full" aria-labelledby="mood-heading">
      <header className="mb-4"><h2 id="mood-heading" className="section-kicker">Our Mood</h2></header>
      {saveError && <p className="mood-save-error" role="alert">{saveError}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoodCard mood={me?.mood ?? null} message={me?.message ?? null} updatedAt={me?.updatedAt ?? null} name={currentUserName} email={me?.email ?? null} image={me?.image ?? null} isCurrentUser onEdit={() => setShowSelector(true)} />
        {partnerName && <MoodCard mood={partner?.mood ?? null} message={partner?.message ?? null} updatedAt={partner?.updatedAt ?? null} name={partnerName} email={partner?.email ?? null} image={partner?.image ?? null} isCurrentUser={false} />}
      </div>
      {!partnerName && <p className="mood-waiting">Your space is ready for the other half.</p>}
      {showSelector && <MoodSelector currentMood={me?.mood ?? null} onSelect={handleMoodSelect} onClose={() => setShowSelector(false)} />}
    </section>
  );
}
