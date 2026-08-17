import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { api } from "../api/client";
import { colors } from "../theme";

export default function ReaderScreen({ route }: any) {
  const { id } = route.params;
  const [chapter, setChapter] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [fontSize, setFontSize] = useState(17);

  useEffect(() => {
    api.get(`/chapters/${id}`).then((res) => setChapter(res.data));
    api.get(`/comments/chapter/${id}`).then((res) => setComments(res.data));
  }, [id]);

  async function postComment() {
    if (!commentText.trim()) return;
    const { data } = await api.post("/comments", { content: commentText, chapterId: id });
    setComments((c) => [data, ...c]);
    setCommentText("");
  }

  if (!chapter) return <View style={styles.container}><Text style={styles.empty}>Chargement...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>{chapter.title}</Text>

      <View style={styles.fontControls}>
        <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize((f) => Math.max(13, f - 2))}>
          <Text>A-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize((f) => Math.min(26, f + 2))}>
          <Text>A+</Text>
        </TouchableOpacity>
        <Text style={styles.views}>{chapter.views} vues</Text>
      </View>

      <Text style={[styles.content, { fontSize }]}>{chapter.content || "Ce chapitre n'a pas encore de contenu."}</Text>

      <Text style={styles.sectionTitle}>Commentaires ({comments.length})</Text>
      <View style={styles.commentInputRow}>
        <TextInput style={styles.commentInput} placeholder="Réagir..." value={commentText} onChangeText={setCommentText} />
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  fontControls: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  fontBtn: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  views: { marginLeft: "auto", color: colors.neutral400, fontSize: 12 },
  content: { lineHeight: 26, color: colors.neutral900 },
  sectionTitle: { fontWeight: "600", fontSize: 16, marginTop: 26, marginBottom: 8 },
  commentInputRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 10 },
  sendBtn: { backgroundColor: colors.ink600, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" },
  commentCard: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 10, marginBottom: 8 },
  commentAuthor: { fontWeight: "600", fontSize: 12 },
  commentText: { fontSize: 13, color: colors.neutral700, marginTop: 2 },
});
