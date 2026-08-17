import { useEffect, useState } from "react";
import { api } from "../api/client";
import StoryCard from "../components/StoryCard";

export default function Home() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stories?sort=recent").then((res) => setStories(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-ink-600 to-ink-400 rounded-2xl p-10 text-white mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Lisez. Écrivez. Partagez vos histoires.</h1>
        <p className="text-ink-50 max-w-xl">
          InkWave est l'endroit où vos histoires prennent vie et rencontrent leurs lecteurs — et où vous pouvez
          découvrir des milliers de récits écrits par la communauté.
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Nouveautés</h2>
      {loading ? (
        <p className="text-neutral-400">Chargement des histoires...</p>
      ) : stories.length === 0 ? (
        <p className="text-neutral-400">Aucune histoire publiée pour le moment. Soyez le premier à écrire !</p>
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
