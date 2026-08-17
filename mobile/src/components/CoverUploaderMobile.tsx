import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadStoryCoverMobile } from "../api/client";

interface CoverUploaderMobileProps {
  storyId: string;
  currentCoverUrl?: string;
  onSuccess?: (newCoverUrl: string) => void;
}

export const CoverUploaderMobile: React.FC<CoverUploaderMobileProps> = ({
  storyId,
  currentCoverUrl,
  onSuccess,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(currentCoverUrl || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Demande la permission d'accès à la galerie
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à vos photos pour changer la couverture.");
      return;
    }

    // Ouvre la galerie d'images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4], // Format portrait couverture
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedAsset = result.assets[0];
      setImageUri(selectedAsset.uri);

      // Envoi direct vers l'API
      setLoading(true);
      try {
        const data = await uploadStoryCoverMobile(storyId, {
          uri: selectedAsset.uri,
          name: selectedAsset.fileName || undefined,
          type: selectedAsset.mimeType || undefined,
        });

        if (onSuccess) onSuccess(data.coverUrl);
        Alert.alert("Succès", "La couverture a été mise à jour !");
      } catch (err: any) {
        Alert.alert("Erreur", err.response?.data?.error || "Impossible d'importer l'image");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Aucune couverture</Text>
          </View>
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Téléversement..." : "Changer la couverture"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  imageContainer: {
    width: 120,
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  placeholderText: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4f46e5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});