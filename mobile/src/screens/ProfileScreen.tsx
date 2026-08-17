import { useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StoryCard from "../components/StoryCard";
import { colors } from "../theme";
import { AvatarUploaderMobile } from "../components/AvatarUploaderMobile"; // <-- Import du composant mobile

export default function ProfileScreen({ route, navigation }: any) {
  const { username } = route.params;
  const { user: currentUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  function load() {
    api.get(`/users/${username}`).then((res) => setProfile(res.data));
  }

  useEffect(load, [username]);

  async function toggleFollow() {
    if (!currentUser) return Alert.alert("Connexion requise", "Connectez-vous pour suivre cet auteur.");
    const { data } = await api.post(`/users/${username}/follow`);
    setProfile((p: any) => ({ ...p, isFollowing: data.following, followersCount: p.followersCount + (data.following ? 1 : -1) }));
  }

  if (!profile) return <View style={styles.container}><Text style={styles.empty}>Chargement...</Text></View>;

  const isMe = currentUser?.username === username;

  return (
    <FlatList
      style={styles.container}
      data={profile.stories}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListEmptyComponent={<Text style={styles.empty}>Aucune histoire publiée.</Text>}
      renderItem={({ item }) => (
        <StoryCard story={{ ...item, author: profile }} onPress={() => navigation.navigate("StoryDetail", { id: item.id })} />
      )}
      ListHeaderComponent={
        <View style={{ padding: 16 }}>
          <View style={styles.header}>
            {/* Si c'est mon profil, on utilise le composant uploader d'avatar */}
            {isMe ? (
              <AvatarUploaderMobile
                currentAvatarUrl={profile.avatarUrl}
                onSuccess={(newAvatarUrl) =>
                  setProfile((p: any) => ({ ...p, avatarUrl: newAvatarUrl }))
                }
              />
            ) : (
              <Image
                source={{
                  uri: profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`,
                }}
                style={styles.avatar}
              />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile.displayName || profile.username}</Text>
              <Text style={styles.username}>@{profile.username}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.stat}><Text style={styles.statNum}>{profile.storiesCount}</Text> histoires</Text>
            <Text style={styles.stat}><Text style={styles.statNum}>{profile.followersCount}</Text> abonnés</Text>
            <Text style={styles.stat}><Text style={styles.statNum}>{profile.followingCount}</Text> abonnements</Text>
          </View>

          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {isMe ? (
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={{ color: colors.red600, fontWeight: "600" }}>Se déconnecter</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.followBtn, profile.isFollowing && styles.followBtnActive]} onPress={toggleFollow}>
              <Text style={[styles.followBtnText, profile.isFollowing && styles.followBtnTextActive]}>
                {profile.isFollowing ? "Abonné(e)" : "Suivre"}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>Histoires publiées</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  empty: { textAlign: "center", color: colors.neutral400, marginTop: 30 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 14 },
  name: { fontSize: 20, fontWeight: "bold" },
  username: { color: colors.neutral500 },
  statsRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  stat: { fontSize: 13, color: colors.neutral700 },
  statNum: { fontWeight: "700" },
  bio: { marginTop: 10, color: colors.neutral700, lineHeight: 20 },
  followBtn: { marginTop: 14, borderWidth: 1, borderColor: colors.ink600, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  followBtnActive: { backgroundColor: colors.ink600 },
  followBtnText: { color: colors.ink600, fontWeight: "600" },
  followBtnTextActive: { color: "white" },
  logoutBtn: { marginTop: 14, borderWidth: 1, borderColor: colors.red600, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  sectionTitle: { fontWeight: "600", fontSize: 16, marginTop: 22, marginBottom: 4 },
});