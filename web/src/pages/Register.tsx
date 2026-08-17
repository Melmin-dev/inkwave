import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-serif font-bold mb-6 text-center">Créer un compte</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
        <div>
          <label className="text-sm font-medium">Nom d'utilisateur</label>
          <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">Mot de passe</label>
          <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Création..." : "S'inscrire"}
        </button>
        <p className="text-sm text-center text-neutral-500">
          Déjà inscrit ? <Link to="/login" className="text-ink-600 font-medium">Connectez-vous</Link>
        </p>
      </form>
    </div>
  );
}
