import { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { api } from "../api/client";
import StoryCard from "../components/StoryCard";
import { colors } from "../theme";

const GENRES = ["Tous", "Romance", "Fantasy", "Science-Fiction", "Thriller", "Horreur", "Aventure", "Drame", "Humour", "Autre"];

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ stories: any[]; users: any[] }>({ stories: [], users: [] });
  const [genre, setGenre] = useState("Tous");
  const [browseResults, setBrowseResults] = useState<any[]>([]);

  async function search(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults({ stories: [], users: [] });
      return;
    }
    const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
    setResults(data);
  }

  async function selectGenre(g: string) {
    setGenre(g);
    const { data } = await api.get(`/stories?genre=${encodeURIComponent(g)}&sort=recent`);
    setBrowseResults(data);
  }

  const showingSearch = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Rechercher une histoire, un auteur..."
        value={query}
        onChangeText={search}
      />

      {!showingSearch && (
        <FlatList
          horizontal
          data={GENRES}
          keyExtractor={(g) => g}
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12, marginBottom: 4, flexGrow: 0 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectGenre(item)}
              style={[styles.chip, genre === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, genre === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {showingSearch ? (
        <FlatList
          data={results.stories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          ListHeaderComponent={
            results.users.length > 0 ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Auteurs</Text>
                <FlatList
                  horizontal
                  data={results.users}
                  keyExtractor={(u) => u.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.userChip} onPress={() => navigation.navigate("Profile", { username: item.username })}>
                      <Image source={{ uri: item.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${item.username}` }} style={styles.avatar} />
                      <Text style={styles.userChipText}>{item.displayName || item.username}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <StoryCard story={item} onPress={() => navigation.navigate("StoryDetail", { id: item.id })} />
          )}
        />
      ) : (
        <FlatList
          data={browseResults}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <StoryCard story={item} onPress={() => navigation.navigate("StoryDetail", { id: item.id })} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 16 },
  input: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.neutral200, marginRight: 8 },
  chipActive: { backgroundColor: colors.ink600, borderColor: colors.ink600 },
  chipText: { fontSize: 13, color: colors.neutral700 },
  chipTextActive: { color: "white" },
  sectionTitle: { fontWeight: "600", marginBottom: 6 },
  userChip: { alignItems: "center", marginRight: 14, width: 64 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginBottom: 4 },
  userChipText: { fontSize: 11, textAlign: "center" },
});
