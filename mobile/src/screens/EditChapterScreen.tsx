import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { api } from "../api/client";
import { colors } from "../theme";

export default function EditChapterScreen({ route, navigation }: any) {
  const { storyId, chapterId } = route.params;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

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
      Alert.alert(pub ? "Chapitre publié !" : "Brouillon enregistré");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    Alert.alert("Supprimer ce chapitre ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/chapters/${chapterId}`);
          navigation.navigate("WriteStory", { id: storyId });
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder="Titre du chapitre" />
      <TextInput
        style={styles.contentInput}
        value={content}
        onChangeText={setContent}
        placeholder="Il était une fois..."
        multiline
        textAlignVertical="top"
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={remove}>
          <Text style={{ color: colors.red600 }}>Supprimer</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => save(false)} disabled={saving}>
            <Text style={{ fontWeight: "600" }}>Brouillon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => save(true)} disabled={saving}>
            <Text style={{ color: "white", fontWeight: "600" }}>{published ? "Mettre à jour" : "Publier"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  titleInput: { fontSize: 20, fontWeight: "bold", borderBottomWidth: 1, borderColor: colors.neutral200, paddingBottom: 8, marginBottom: 12 },
  contentInput: { minHeight: 300, fontSize: 16, lineHeight: 24, borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 12 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  primaryBtn: { backgroundColor: colors.ink600, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
});
