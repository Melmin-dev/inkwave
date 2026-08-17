import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert } from "react-native";
import { api } from "../api/client";
import { colors } from "../theme";

const GENRES = ["Romance", "Fantasy", "Science-Fiction", "Thriller", "Horreur", "Aventure", "Drame", "Humour", "Autre"];

export default function WriteStoryScreen({ route, navigation }: any) {
  const { id } = route.params;
  const isNew = id === "new";
  const [storyId, setStoryId] = useState(isNew ? null : id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [published, setPublished] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!isNew) {
      api.get(`/stories/${id}`).then((res) => {
        const s = res.data;
        setTitle(s.title);
        setDescription(s.description);
        setGenre(s.genre);
        setPublished(s.published);
        setChapters(s.chapters);
      });
    }
  }

  useEffect(load, [id]);

  async function save() {
    setSaving(true);
    try {
      if (isNew && !storyId) {
        const { data } = await api.post("/stories", { title, description, genre });
        setStoryId(data.id);
        navigation.setParams({ id: data.id });
        Alert.alert("Histoire créée !", "Vous pouvez maintenant ajouter des chapitres.");
      } else {
        await api.put(`/stories/${storyId}`, { title, description, genre, published });
        Alert.alert("Enregistré");
      }
    } finally {
      setSaving(false);
    }
  }

  async function addChapter() {
    if (!storyId) {
      Alert.alert("Enregistrez d'abord l'histoire", "Sauvegardez le titre et la description avant d'ajouter un chapitre.");
      return;
    }
    const { data } = await api.post(`/chapters/story/${storyId}`, { title: `Chapitre ${chapters.length + 1}`, content: "" });
    navigation.navigate("EditChapter", { storyId, chapterId: data.id });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Le titre de votre histoire" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 90 }]} value={description} onChangeText={setDescription} multiline placeholder="De quoi parle votre histoire ?" />

      <Text style={styles.label}>Genre</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {GENRES.map((g) => (
          <TouchableOpacity key={g} style={[styles.chip, genre === g && styles.chipActive]} onPress={() => setGenre(g)}>
            <Text style={[styles.chipText, genre === g && styles.chipTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!isNew && (
        <View style={styles.switchRow}>
          <Text style={styles.label}>Publier l'histoire</Text>
          <Switch value={published} onValueChange={setPublished} trackColor={{ true: colors.ink600 }} />
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving || !title}>
        <Text style={{ color: "white", fontWeight: "600" }}>{saving ? "Enregistrement..." : "Enregistrer"}</Text>
      </TouchableOpacity>

      {storyId && (
        <>
          <View style={styles.chaptersHeader}>
            <Text style={styles.sectionTitle}>Chapitres ({chapters.length})</Text>
            <TouchableOpacity onPress={addChapter}>
              <Text style={{ color: colors.ink600, fontWeight: "600" }}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          {chapters.map((c, i) => (
            <TouchableOpacity key={c.id} style={styles.chapterRow} onPress={() => navigation.navigate("EditChapter", { storyId, chapterId: c.id })}>
              <Text style={styles.chapterTitle}>{i + 1}. {c.title} {!c.published && "(brouillon)"}</Text>
              <Text style={{ color: colors.ink600 }}>Modifier</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  label: { fontWeight: "600", fontSize: 13, marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.neutral200, marginRight: 8 },
  chipActive: { backgroundColor: colors.ink600, borderColor: colors.ink600 },
  chipText: { fontSize: 13, color: colors.neutral700 },
  chipTextActive: { color: "white" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  saveBtn: { backgroundColor: colors.ink600, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 20 },
  chaptersHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28, marginBottom: 8 },
  sectionTitle: { fontWeight: "600", fontSize: 16 },
  chapterRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.neutral200 },
  chapterTitle: { fontSize: 13, fontWeight: "500", flex: 1 },
});
