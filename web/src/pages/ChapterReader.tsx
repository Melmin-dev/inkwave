import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ChapterReader() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chapter, setChapter] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    api.get(`/chapters/${id}`).then((res) => setChapter(res.data));
    api.get(`/comments/chapter/${id}`).then((res) => setComments(res.data));
  }, [id]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { data } = await api.post("/comments", { content: commentText, chapterId: id });
    setComments((c) => [data, ...c]);
    setCommentText("");
  }

  if (!chapter) return <p className="text-center py-20 text-neutral-400">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/story/${chapter.story.id}`} className="text-sm text-ink-600 font-medium">
        ← {chapter.story.title}
      </Link>
      <h1 className="text-2xl font-serif font-bold mt-2 mb-2">{chapter.title}</h1>

      <div className="flex items-center gap-2 mb-6 text-sm text-neutral-500">
        <button onClick={() => setFontSize((f) => Math.max(14, f - 2))} className="btn-secondary px-2 py-1">A-</button>
        <button onClick={() => setFontSize((f) => Math.min(28, f + 2))} className="btn-secondary px-2 py-1">A+</button>
        <span>{chapter.views} vues</span>
      </div>

      <article
        className="prose max-w-none font-serif whitespace-pre-wrap leading-relaxed"
        style={{ fontSize }}
      >
        {chapter.content || "Ce chapitre n'a pas encore de contenu."}
      </article>

      <h2 className="text-lg font-semibold mt-10 mb-3">Commentaires ({comments.length})</h2>
      <form onSubmit={postComment} className="flex gap-2 mb-4">
        <input
          className="input"
          placeholder={user ? "Réagir à ce chapitre..." : "Connectez-vous pour commenter"}
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
