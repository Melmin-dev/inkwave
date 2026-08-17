import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const INK_600 = "#bc2569";

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    coverUrl?: string | null;
    genre: string;
    author?: { username: string; displayName?: string | null };
    _count?: { likes?: number; chapters?: number };
  };
  onPress: () => void;
}

export default function StoryCard({ story, onPress }: StoryCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cover}>
        {story.coverUrl ? (
          <Image source={{ uri: story.coverUrl }} style={styles.coverImg} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText} numberOfLines={4}>
              {story.title}
            </Text>
          </View>
        )}
        <View style={styles.genreBadge}>
          <Text style={styles.genreBadgeText}>{story.genre}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{story.title}</Text>
      {story.author && (
        <Text style={styles.author} numberOfLines={1}>de {story.author.displayName || story.author.username}</Text>
      )}
      <Text style={styles.meta}>❤️ {story._count?.likes ?? 0}  📖 {story._count?.chapters ?? 0}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: "48%", marginBottom: 16 },
  cover: { aspectRatio: 3 / 4, borderRadius: 12, overflow: "hidden", backgroundColor: INK_600 },
  coverImg: { width: "100%", height: "100%" },
  coverPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", padding: 10 },
  coverPlaceholderText: { color: "white", fontWeight: "600", textAlign: "center" },
  genreBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  genreBadgeText: { color: "white", fontSize: 11 },
  title: { fontWeight: "600", fontSize: 13, marginTop: 6 },
  author: { fontSize: 12, color: "#737373", marginTop: 2 },
  meta: { fontSize: 11, color: "#a3a3a3", marginTop: 4 },
});
