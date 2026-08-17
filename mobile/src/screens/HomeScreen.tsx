import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { api } from "../api/client";
import StoryCard from "../components/StoryCard";
import { colors } from "../theme";

export default function HomeScreen({ navigation }: any) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    return api.get("/stories?sort=recent").then((res) => setStories(res.data));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lisez. Écrivez. Partagez.</Text>
        <Text style={styles.headerSubtitle}>Découvrez les dernières histoires de la communauté</Text>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Aucune histoire publiée pour le moment.</Text> : null
        }
        renderItem={({ item }) => (
          <StoryCard story={item} onPress={() => navigation.navigate("StoryDetail", { id: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { backgroundColor: colors.ink600, padding: 20, paddingTop: 12 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: colors.ink100, marginTop: 4, fontSize: 13 },
  empty: { textAlign: "center", color: colors.neutral400, marginTop: 40 },
});
