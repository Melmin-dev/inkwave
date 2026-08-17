import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

const GENRES = ["Romance", "Fantasy", "Science-Fiction", "Thriller", "Horreur", "Aventure", "Drame", "Humour", "Autre"];

export default function WriteStory() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("ongoing");
  const [published, setPublished] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.get(`/stories/${id}`).then((res) => {
        const s = res.data;
        setTitle(s.title);
        setDescription(s.description);
        setGenre(s.genre);
        setTags(s.tags);
        setStatus(s.status);
        setPublished(s.published);
        setCoverUrl(s.coverUrl || "");
        setChapters(s.chapters);
      });
    }
  }, [id, isNew]);

  async function saveStory() {
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await api.post("/stories", { title, description, genre, tags, status, coverUrl });
        navigate(`/write/${data.id}`, { replace: true });
      } else {
        await api.put(`/stories/${id}`, { title, description, genre, tags, status, coverUrl, published });
      }
    } finally {
      setSaving(false);
    }
  }

  async function addChapter() {
    if (isNew) {
      alert("Enregistrez d'abord l'histoire avant d'ajouter un chapitre.");
      return;
    }
    const { data } = await api.post(`/chapters/story/${id}`, { title: `Chapitre ${chapters.length + 1}`, content: "" });
    navigate(`/write/${id}/chapter/${data.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold mb-6">{isNew ? "Nouvelle histoire" : "Gérer l'histoire"}</h1>

      <div className="card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Titre</label>
          <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea className="input mt-1" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Genre</label>
            <select className="input mt-1" value={genre} onChange={(e) => setGenre(e.target.value)}>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Statut</label>
            <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ongoing">En cours</option>
              <option value="completed">Terminée</option>
              <option value="hiatus">En pause</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Tags (séparés par des virgules)</label>
          <input className="input mt-1" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="magie,amour,héros" />
        </div>
        <div>
          <label className="text-sm font-medium">URL de couverture (optionnel)</label>
          <input className="input mt-1" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
        </div>
        {!isNew && (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Histoire publiée (visible par tous)
          </label>
        )}
        <button onClick={saveStory} disabled={saving || !title} className="btn-primary">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {!isNew && (
        <>
          <div className="flex items-center justify-between mt-8 mb-3">
            <h2 className="text-lg font-semibold">Chapitres ({chapters.length})</h2>
            <button onClick={addChapter} className="btn-secondary text-sm">+ Ajouter un chapitre</button>
          </div>
          <ul className="divide-y divide-neutral-200 card">
            {chapters.map((c, i) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">
                  {i + 1}. {c.title} {!c.published && <span className="text-xs text-amber-600">(brouillon)</span>}
                </span>
                <button onClick={() => navigate(`/write/${id}/chapter/${c.id}`)} className="text-sm text-ink-600 font-medium">
                  Modifier
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
