import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import StoryCard from "../components/StoryCard";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState<{ stories: any[]; users: any[] }>({ stories: [], users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(q)}`).then((res) => setResults(res.data)).finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold mb-6">Résultats pour "{q}"</h1>
      {loading ? (
        <p className="text-neutral-400">Recherche...</p>
      ) : (
        <>
          {results.users.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Auteurs</h2>
              <div className="flex flex-wrap gap-3">
                {results.users.map((u) => (
                  <Link key={u.id} to={`/profile/${u.username}`} className="card p-3 flex items-center gap-2">
                    <img
                      src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium">{u.displayName || u.username}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-3">Histoires</h2>
          {results.stories.length === 0 ? (
            <p className="text-neutral-400">Aucune histoire trouvée.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {results.stories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
