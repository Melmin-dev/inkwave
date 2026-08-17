import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-2xl font-serif font-bold text-ink-700 shrink-0">
          InkWave
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher une histoire, un auteur..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
          />
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Link to="/browse" className="text-sm font-medium text-neutral-700 hover:text-ink-600">
            Découvrir
          </Link>
          {user ? (
            <>
              <Link to="/library" className="text-sm font-medium text-neutral-700 hover:text-ink-600">
                Bibliothèque
              </Link>
              <Link to="/write/new" className="btn-primary text-sm">
                Écrire
              </Link>
              <Link to={`/profile/${user.username}`} className="flex items-center gap-2">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                />
              </Link>
              <button onClick={logout} className="text-sm text-neutral-500 hover:text-ink-600">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-neutral-700 hover:text-ink-600">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
