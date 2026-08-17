import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StoryCard from "../components/StoryCard";
import { colors } from "../theme";

export default function LibraryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"library" | "mine">("library");
  const [stories, setStories] = useState<any[]>([]);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    return Promise.all([api.get("/library"), api.get("/stories/mine/list")]).then(([lib, mine]) => {
      setStories(lib.data);
      setMyStories(mine.data);
    });
  }

  useFocusEffect(
    useCallback(() => {
      if (user) load();
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, []);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Connectez-vous pour accéder à votre bibliothèque.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Auth")}>
          <Text style={{ color: "white", fontWeight: "600" }}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const data = tab === "library" ? stories : myStories;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === "library" && styles.tabActive]} onPress={() => setTab("library")}>
          <Text style={[styles.tabText, tab === "library" && styles.tabTextActive]}>Ma bibliothèque</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "mine" && styles.tabActive]} onPress={() => setTab("mine")}>
          <Text style={[styles.tabText, tab === "mine" && styles.tabTextActive]}>Mes histoires</Text>
        </TouchableOpacity>
      </View>

      {tab === "mine" && (
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate("WriteStory", { id: "new" })}>
          <Text style={{ color: "white", fontWeight: "600" }}>+ Nouvelle histoire</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Rien à afficher ici pour le moment.</Text>}
        renderItem={({ item }) => (
          <StoryCard
            story={item}
            onPress={() =>
              tab === "mine"
                ? navigation.navigate("WriteStory", { id: item.id })
                : navigation.navigate("StoryDetail", { id: item.id })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { textAlign: "center", color: colors.neutral400, marginTop: 30 },
  loginBtn: { backgroundColor: colors.ink600, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 14 },
  tabs: { flexDirection: "row", padding: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: colors.neutral50 },
  tabActive: { backgroundColor: colors.ink600 },
  tabText: { color: colors.neutral700, fontWeight: "500", fontSize: 13 },
  tabTextActive: { color: "white" },
  newBtn: { backgroundColor: colors.ink600, borderRadius: 10, padding: 10, alignItems: "center", marginHorizontal: 16, marginBottom: 10 },
});
