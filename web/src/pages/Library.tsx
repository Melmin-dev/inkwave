import { useEffect, useState } from "react";
import { api } from "../api/client";
import StoryCard from "../components/StoryCard";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Library() {
  const { user } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/library"), api.get("/stories/mine/list")])
      .then(([lib, mine]) => {
        setStories(lib.data);
        setMyStories(mine.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-20 text-neutral-400">Chargement...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-serif font-bold">Ma bibliothèque</h1>
      </div>
      {stories.length === 0 ? (
        <p className="text-neutral-400 mb-10">Vous n'avez encore ajouté aucune histoire à votre bibliothèque.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif font-bold">Mes histoires</h2>
        <Link to="/write/new" className="btn-primary text-sm">+ Nouvelle histoire</Link>
      </div>
      {myStories.length === 0 ? (
        <p className="text-neutral-400">Vous n'avez pas encore commencé à écrire.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {myStories.map((s) => (
            <Link to={`/write/${s.id}`} key={s.id} className="card p-3">
              <p className="font-semibold text-sm">{s.title}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {s.published ? "Publiée" : "Brouillon"} · {s._count.chapters} ch. · ❤️ {s._count.likes}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
