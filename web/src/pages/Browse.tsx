import { useEffect, useState } from "react";
import { api } from "../api/client";
import StoryCard from "../components/StoryCard";

const GENRES = ["Tous", "Romance", "Fantasy", "Science-Fiction", "Thriller", "Horreur", "Aventure", "Drame", "Humour", "Autre"];

export default function Browse() {
  const [stories, setStories] = useState<any[]>([]);
  const [genre, setGenre] = useState("Tous");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/stories?genre=${encodeURIComponent(genre)}&sort=${sort}`)
      .then((res) => setStories(res.data))
      .finally(() => setLoading(false));
  }, [genre, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold mb-6">Découvrir</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              genre === g ? "bg-ink-600 text-white border-ink-600" : "bg-white text-neutral-700 border-neutral-300"
            }`}
          >
            {g}
          </button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-auto input w-auto text-sm">
          <option value="recent">Récemment mis à jour</option>
          <option value="views">Les plus vus</option>
        </select>
      </div>

      {loading ? (
        <p className="text-neutral-400">Chargement...</p>
      ) : stories.length === 0 ? (
        <p className="text-neutral-400">Aucune histoire trouvée dans ce genre.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}
    </div>
  );
}
