import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { CoverUploader } from "../components/CoverUploader"; // <-- Import du composant

export default function StoryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    api.get(`/stories/${id}`).then((res) => setStory(res.data)).finally(() => setLoading(false));
    api.get(`/comments/story/${id}`).then((res) => setComments(res.data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleLike() {
    if (!user) return navigate("/login");
    const { data } = await api.post(`/stories/${id}/like`);
    setStory((s: any) => ({ ...s, isLiked: data.liked, _count: { ...s._count, likes: s._count.likes + (data.liked ? 1 : -1) } }));
  }

  async function toggleLibrary() {
    if (!user) return navigate("/login");
    const { data } = await api.post(`/library/${id}`);
    setStory((s: any) => ({ ...s, isInLibrary: data.inLibrary }));
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!commentText.trim()) return;
    const { data } = await api.post("/comments", { content: commentText, storyId: id });
    setComments((c) => [data, ...c]);
    setCommentText("");
  }

  async function deleteStory() {
    if (!confirm("Supprimer définitivement cette histoire ?")) return;
    await api.delete(`/stories/${id}`);
    navigate("/library");
  }

  if (loading) return <p className="text-center py-20 text-neutral-400">Chargement...</p>;
  if (!story) return <p className="text-center py-20 text-neutral-400">Histoire introuvable.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Conteneur Couverture + Uploader si Propriétaire */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-40 aspect-[3/4] rounded-xl bg-gradient-to-br from-ink-200 to-ink-500 shrink-0 overflow-hidden shadow-md">
            {story.coverUrl ? (
              <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <span className="text-white font-serif text-center text-sm">{story.title}</span>
              </div>
            )}
          </div>

          {/* Si c'est l'auteur, on active l'uploader de couverture */}
          {story.isOwner && (
            <CoverUploader
              storyId={story.id}
              currentCoverUrl={story.coverUrl}
              onSuccess={(newCoverUrl) =>
                setStory((s: any) => ({ ...s, coverUrl: newCoverUrl }))
              }
            />
          )}
        </div>

        {/* Informations de l'histoire */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold">{story.title}</h1>
          <Link to={`/profile/${story.author.username}`} className="text-sm text-ink-600 font-medium">
            de {story.author.displayName || story.author.username}
          </Link>
          <p className="text-sm text-neutral-500 mt-1">
            {story.genre} · {story.status === "completed" ? "Terminée" : story.status === "hiatus" ? "En pause" : "En cours"}
          </p>
          <p className="mt-3 text-neutral-700">{story.description}</p>

          <div className="flex gap-2 mt-4 flex-wrap">
            <button onClick={toggleLike} className={story.isLiked ? "btn-primary text-sm" : "btn-secondary text-sm"}>
              ❤️ {story._count.likes} {story.isLiked ? "Aimé" : "J'aime"}
            </button>
            <button onClick={toggleLibrary} className={story.isInLibrary ? "btn-primary text-sm" : "btn-secondary text-sm"}>
              {story.isInLibrary ? "📚 Dans ma bibliothèque" : "+ Ajouter à ma bibliothèque"}
            </button>
            {story.isOwner && (
              <>
                <Link to={`/write/${story.id}`} className="btn-secondary text-sm">
                  ✏️ Gérer l'histoire
                </Link>
                <button onClick={deleteStory} className="text-sm text-red-600 px-3">
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Liste des chapitres */}
      <h2 className="text-lg font-semibold mt-8 mb-3">Chapitres ({story.chapters.length})</h2>
      {story.chapters.length === 0 ? (
        <p className="text-neutral-400">Aucun chapitre publié pour le moment.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 card">
          {story.chapters.map((c: any, i: number) => (
            <li key={c.id}>
              <Link to={`/read/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
                <span className="font-medium text-sm">
                  {i + 1}. {c.title} {!c.published && <span className="text-xs text-amber-600">(brouillon)</span>}
                </span>
                <span className="text-xs text-neutral-400">{c.views} vues</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Commentaires */}
      <h2 className="text-lg font-semibold mt-8 mb-3">Commentaires ({comments.length})</h2>
      <form onSubmit={postComment} className="flex gap-2 mb-4">
        <input
          className="input"
          placeholder={user ? "Ajouter un commentaire..." : "Connectez-vous pour commenter"}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button className="btn-primary shrink-0">Envoyer</button>
      </form>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="card p-3">
            <p className="text-sm font-medium">{c.user.displayName || c.user.username}</p>
            <p className="text-sm text-neutral-700">{c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}