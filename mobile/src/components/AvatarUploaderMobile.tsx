import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadUserAvatarMobile } from "../api/client";

interface AvatarUploaderMobileProps {
  currentAvatarUrl?: string;
  onSuccess?: (newAvatarUrl: string) => void;
}

export const AvatarUploaderMobile: React.FC<AvatarUploaderMobileProps> = ({
  currentAvatarUrl,
  onSuccess,
}) => {
  const [avatarUri, setAvatarUri] = useState<string | null>(currentAvatarUrl || null);
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "L'accès aux photos est requis pour modifier votre avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Format carré / avatar
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedAsset = result.assets[0];
      setAvatarUri(selectedAsset.uri);

      setLoading(true);
      try {
        const data = await uploadUserAvatarMobile({
          uri: selectedAsset.uri,
          name: selectedAsset.fileName || undefined,
          type: selectedAsset.mimeType || undefined,
        });

        if (onSuccess) onSuccess(data.avatarUrl);
      } catch (err: any) {
        Alert.alert("Erreur", err.response?.data?.error || "Impossible d'importer l'avatar");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} disabled={loading}>
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Avatar</Text>
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickAvatar} disabled={loading}>
        <Text style={styles.changeText}>Changer de photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeText: {
    color: "#4f46e5",
    fontSize: 12,
    fontWeight: "600",
  },
});