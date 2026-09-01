'use client';

import { useState } from 'react';
import MoodCard from './MoodCard';
import MoodSelector from './MoodSelector';
import { MoodPairView } from '@/lib/couple-space/mood';

interface MoodSectionProps {
  moods: MoodPairView;
}

export default function MoodSection({ moods }: MoodSectionProps) {
  const [showSelector, setShowSelector] = useState(false);

  const handleMoodSelect = async (mood: import('@/lib/couple-space/validation').Mood) => {
    try {
      const res = await fetch('/api/mood', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update mood');
      }
    } catch {
      alert('Failed to update mood. Please try again.');
    }
  };

  const me = moods.me;
  const partner = moods.partner;

  return (
    <section className="w-full" aria-labelledby="mood-heading">
      <header className="mb-4">
        <h2 id="mood-heading" className="text-xs font-medium tracking-wider uppercase text-muted">Our Mood</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoodCard
          mood={me?.mood ?? null}
          message={me?.message ?? null}
          updatedAt={me?.updatedAt ?? null}
          name={me?.name ?? null}
          email={me?.email ?? null}
          image={me?.image ?? null}
          isCurrentUser={true}
          onEdit={() => setShowSelector(true)}
        />

        <MoodCard
          mood={partner?.mood ?? null}
          message={partner?.message ?? null}
          updatedAt={partner?.updatedAt ?? null}
          name={partner?.name ?? null}
          email={partner?.email ?? null}
          image={partner?.image ?? null}
          isCurrentUser={false}
        />
      </div>

      {showSelector && (
        <MoodSelector
          currentMood={me?.mood ?? null}
          onSelect={handleMoodSelect}
          onClose={() => setShowSelector(false)}
        />
      )}
    </section>
  );
}