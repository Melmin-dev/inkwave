import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import { CoverUploaderMobile } from "../components/CoverUploaderMobile"; // <-- Import du composant mobile

export default function StoryDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [story, setStory] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  function load() {
    api.get(`/stories/${id}`).then((res) => setStory(res.data));
    api.get(`/comments/story/${id}`).then((res) => setComments(res.data));
  }

  useEffect(load, [id]);

  async function toggleLike() {
    if (!user) return Alert.alert("Connexion requise", "Connectez-vous pour aimer une histoire.");
    const { data } = await api.post(`/stories/${id}/like`);
    setStory((s: any) => ({ ...s, isLiked: data.liked, _count: { ...s._count, likes: s._count.likes + (data.liked ? 1 : -1) } }));
  }

  async function toggleLibrary() {
    if (!user) return Alert.alert("Connexion requise", "Connectez-vous pour ajouter à votre bibliothèque.");
    const { data } = await api.post(`/library/${id}`);
    setStory((s: any) => ({ ...s, isInLibrary: data.inLibrary }));
  }

  async function postComment() {
    if (!user) return Alert.alert("Connexion requise", "Connectez-vous pour commenter.");
    if (!commentText.trim()) return;
    const { data } = await api.post("/comments", { content: commentText, storyId: id });
    setComments((c) => [data, ...c]);
    setCommentText("");
  }

  if (!story) return <View style={styles.container}><Text style={styles.empty}>Chargement...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        {/* Si c'est le propriétaire, on affiche le CoverUploaderMobile, sinon la couverture statique */}
        {story.isOwner ? (
          <CoverUploaderMobile
            storyId={story.id}
            currentCoverUrl={story.coverUrl}
            onSuccess={(newCoverUrl) =>
              setStory((s: any) => ({ ...s, coverUrl: newCoverUrl }))
            }
          />
        ) : (
          <View style={styles.cover}>
            {story.coverUrl ? (
              <Image source={{ uri: story.coverUrl }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Text style={styles.coverText}>{story.title}</Text>
            )}
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{story.title}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profile", { username: story.author.username })}>
            <Text style={styles.author}>de {story.author.displayName || story.author.username}</Text>
          </TouchableOpacity>
          <Text style={styles.genre}>{story.genre} · {story.status === "completed" ? "Terminée" : "En cours"}</Text>
        </View>
      </View>

      <Text style={styles.description}>{story.description}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, story.isLiked && styles.actionBtnActive]} onPress={toggleLike}>
          <Text style={[styles.actionBtnText, story.isLiked && styles.actionBtnTextActive]}>❤️ {story._count.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, story.isInLibrary && styles.actionBtnActive]} onPress={toggleLibrary}>
          <Text style={[styles.actionBtnText, story.isInLibrary && styles.actionBtnTextActive]}>
            {story.isInLibrary ? "📚 Dans ma bibliothèque" : "+ Bibliothèque"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Chapitres ({story.chapters.length})</Text>
      {story.chapters.map((c: any, i: number) => (
        <TouchableOpacity key={c.id} style={styles.chapterRow} onPress={() => navigation.navigate("Reader", { id: c.id })}>
          <Text style={styles.chapterTitle}>{i + 1}. {c.title}</Text>
          <Text style={styles.chapterViews}>{c.views} vues</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Commentaires ({comments.length})</Text>
      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Ajouter un commentaire..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={postComment}>
          <Text style={{ color: "white", fontWeight: "600" }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
      {comments.map((c) => (
        <View key={c.id} style={styles.commentCard}>
          <Text style={styles.commentAuthor}>{c.user.displayName || c.user.username}</Text>
          <Text style={styles.commentText}>{c.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  empty: { textAlign: "center", color: colors.neutral400, marginTop: 40 },
  header: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cover: { width: 100, aspectRatio: 3 / 4, borderRadius: 10, backgroundColor: colors.ink600, alignItems: "center", justifyContent: "center", padding: 6, marginRight: 12, overflow: "hidden" },
  coverText: { color: "white", fontWeight: "600", textAlign: "center", fontSize: 12 },
  title: { fontSize: 20, fontWeight: "bold" },
  author: { color: colors.ink600, fontWeight: "500", marginTop: 4 },
  genre: { color: colors.neutral500, fontSize: 12, marginTop: 4 },
  description: { marginTop: 14, color: colors.neutral700, lineHeight: 20 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  actionBtn: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  actionBtnActive: { backgroundColor: colors.ink600, borderColor: colors.ink600 },
  actionBtnText: { fontSize: 13, color: colors.neutral700 },
  actionBtnTextActive: { color: "white" },
  sectionTitle: { fontWeight: "600", fontSize: 16, marginTop: 22, marginBottom: 8 },
  chapterRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.neutral200 },
  chapterTitle: { fontSize: 13, fontWeight: "500", flex: 1 },
  chapterViews: { fontSize: 11, color: colors.neutral400 },
  commentInputRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 10 },
  sendBtn: { backgroundColor: colors.ink600, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" },
  commentCard: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 10, marginBottom: 8 },
  commentAuthor: { fontWeight: "600", fontSize: 12 },
  commentText: { fontSize: 13, color: colors.neutral700, marginTop: 2 },
});