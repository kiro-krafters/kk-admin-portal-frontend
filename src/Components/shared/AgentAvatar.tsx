interface AgentAvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md';
}

export default function AgentAvatar({ initials, color, size = 'md' }: AgentAvatarProps) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold ${dim}`}
      style={{ background: `${color}22`, color }}
    >
      {initials}
    </div>
  );
}
