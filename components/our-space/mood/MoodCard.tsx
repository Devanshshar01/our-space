'use client';

import { Mood } from '@/lib/couple-space/validation';
import { Badge } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface MoodCardProps {
  mood: Mood | null;
  message: string | null;
  updatedAt: Date | null;
  name: string;
  email: string | null;
  image: string | null;
  isCurrentUser: boolean;
  onEdit?: () => void;
}

const moodLabels: Record<Mood, string> = { GREAT: 'Great', GOOD: 'Good', MEH: 'Meh', SAD: 'Sad', FRUSTRATED: 'Frustrated', MISSING_YOU: 'Missing you' };

function formatRelativeTime(date: Date | null): string {
  if (!date) return '';
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function MoodCard({ mood, updatedAt, name, image, isCurrentUser, onEdit, message }: MoodCardProps) {
  return (
    <article className="mood-card">
      <div className="mood-card-topline">
        <div className="mood-person">
          <Avatar src={image ?? undefined} name={name} size="md" />
          <div><p className="mood-name">{name}</p><p className="mood-role">{isCurrentUser ? 'You' : 'Shared with you'}</p></div>
        </div>
        {isCurrentUser && onEdit && <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Change mood">Edit</Button>}
      </div>
      {mood ? (
        <div className="mood-reading"><span className="mood-indicator" aria-hidden="true" /><div><p className="mood-label">{moodLabels[mood]}</p><Badge variant="accent" size="sm" dot>Current status</Badge></div></div>
      ) : (
        <div className="mood-empty"><p>{isCurrentUser ? 'No mood yet' : 'Nothing here yet.'}</p>{isCurrentUser && onEdit && <Button variant="primary" size="sm" onClick={onEdit}>Set your mood</Button>}</div>
      )}
      {message && <p className="mood-message">&ldquo;{message}&rdquo;</p>}
      {updatedAt && <p className="mood-updated">Updated {formatRelativeTime(updatedAt)}</p>}
    </article>
  );
}
