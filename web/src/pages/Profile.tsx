import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StoryCard from "../components/StoryCard";
import { AvatarUploader } from "../components/AvatarUploader"; // <-- Import du composant

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    api.get(`/users/${username}`).then((res) => setProfile(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [username]);

  async function toggleFollow() {
    if (!currentUser) return navigate("/login");
    const { data } = await api.post(`/users/${username}/follow`);
    setProfile((p: any) => ({
      ...p,
      isFollowing: data.following,
      followersCount: p.followersCount + (data.following ? 1 : -1),
    }));
  }

  if (loading) return <p className="text-center py-20 text-neutral-400">Chargement...</p>;
  if (!profile) return <p className="text-center py-20 text-neutral-400">Utilisateur introuvable.</p>;

  const isMe = currentUser?.username === username;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-5">
        {/* Affichage conditionnel : Uploader si c'est mon profil, image simple sinon */}
        {isMe ? (
          <AvatarUploader
            currentAvatarUrl={profile.avatarUrl}
            onSuccess={(newAvatarUrl) =>
              setProfile((p: any) => ({ ...p, avatarUrl: newAvatarUrl }))
            }
          />
        ) : (
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover border border-neutral-200 shrink-0"
          />
        )}

        <div>
          <h1 className="text-2xl font-serif font-bold">{profile.displayName || profile.username}</h1>
          <p className="text-neutral-500">@{profile.username}</p>
          <p className="text-sm text-neutral-600 mt-1 flex gap-4">
            <span><strong>{profile.storiesCount}</strong> histoires</span>
            <span><strong>{profile.followersCount}</strong> abonnés</span>
            <span><strong>{profile.followingCount}</strong> abonnements</span>
          </p>
        </div>

        <div className="ml-auto">
          {isMe ? (
            <button onClick={() => navigate("/settings")} className="btn-secondary text-sm">Modifier le profil</button>
          ) : (
            <button onClick={toggleFollow} className={profile.isFollowing ? "btn-secondary text-sm" : "btn-primary text-sm"}>
              {profile.isFollowing ? "Abonné(e)" : "Suivre"}
            </button>
          )}
        </div>
      </div>

      {profile.bio && <p className="mt-4 text-neutral-700">{profile.bio}</p>}

      <h2 className="text-lg font-semibold mt-8 mb-3">Histoires publiées</h2>
      {profile.stories.length === 0 ? (
        <p className="text-neutral-400">Aucune histoire publiée pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {profile.stories.map((s: any) => (
            <StoryCard key={s.id} story={{ ...s, author: profile }} />
          ))}
        </div>
      )}
    </div>
  );
}