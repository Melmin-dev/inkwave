import { Link } from "react-router-dom";

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    description: string;
    coverUrl?: string | null;
    genre: string;
    status: string;
    author?: { username: string; displayName?: string | null };
    _count?: { likes?: number; chapters?: number; comments?: number };
  };
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Link to={`/story/${story.id}`} className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] bg-gradient-to-br from-ink-200 to-ink-500 relative overflow-hidden">
        {story.coverUrl ? (
          <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3">
            <span className="text-white font-serif text-center font-semibold text-sm drop-shadow">{story.title}</span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
          {story.genre}
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm line-clamp-2">{story.title}</h3>
        {story.author && (
          <p className="text-xs text-neutral-500 mt-1">
            de {story.author.displayName || story.author.username}
          </p>
        )}
        <p className="text-xs text-neutral-500 mt-auto pt-2 flex gap-3">
          <span>❤️ {story._count?.likes ?? 0}</span>
          <span>📖 {story._count?.chapters ?? 0} ch.</span>
        </p>
      </div>
    </Link>
  );
}
