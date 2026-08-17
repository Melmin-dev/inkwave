import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(emailOrUsername, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-serif font-bold mb-6 text-center">Connexion</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
        <div>
          <label className="text-sm font-medium">Email ou nom d'utilisateur</label>
          <input className="input mt-1" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">Mot de passe</label>
          <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p className="text-sm text-center text-neutral-500">
          Pas de compte ? <Link to="/register" className="text-ink-600 font-medium">Inscrivez-vous</Link>
        </p>
        <p className="text-xs text-center text-neutral-400">
          Démo : alice_writes / password123
        </p>
      </form>
    </div>
  );
}
