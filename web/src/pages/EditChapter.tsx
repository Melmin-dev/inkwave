import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function EditChapter() {
  const { storyId, chapterId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/chapters/${chapterId}`).then((res) => {
      setTitle(res.data.title);
      setContent(res.data.content);
      setPublished(res.data.published);
    });
  }, [chapterId]);

  async function save(publishOverride?: boolean) {
    setSaving(true);
    try {
      const pub = publishOverride ?? published;
      await api.put(`/chapters/${chapterId}`, { title, content, published: pub });
      setPublished(pub);
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Supprimer ce chapitre ?")) return;
    await api.delete(`/chapters/${chapterId}`);
    navigate(`/write/${storyId}`);
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(`/write/${storyId}`)} className="text-sm text-ink-600 font-medium mb-4">
        ← Retour à l'histoire
      </button>

      <input
        className="text-2xl font-serif font-bold w-full mb-4 border-b border-neutral-200 pb-2 focus:outline-none focus:border-ink-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du chapitre"
      />

      <textarea
        className="w-full min-h-[400px] font-serif text-lg leading-relaxed p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-500"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Il était une fois..."
      />

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-neutral-500">{wordCount} mots {savedAt && `· enregistré à ${savedAt}`}</span>
        <div className="flex gap-2">
          <button onClick={remove} className="text-sm text-red-600 px-3">Supprimer</button>
          <button onClick={() => save(false)} disabled={saving} className="btn-secondary">
            Enregistrer le brouillon
          </button>
          <button onClick={() => save(true)} disabled={saving} className="btn-primary">
            {published ? "Mettre à jour (publié)" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}
