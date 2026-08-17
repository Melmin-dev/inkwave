import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Remplacez par l'IP locale de votre machine sur le réseau (pas "localhost",
// qui ne fonctionne pas depuis un téléphone physique ou un simulateur Android).
// Exemple : "http://192.168.1.42:4000/api"
export const API_BASE_URL = "http://192.168.1.132:4000/api";

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("inkwave_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- TYPE & HELPER POUR LE TÉLÉVERSEMENT D'IMAGES (EXPO) ---

export interface MobileImageFile {
  uri: string;
  name?: string;
  type?: string;
}

/**
 * Construit un objet FormData au format spécifique exigé par React Native
 */
function createFormData(file: MobileImageFile, fieldName: string): FormData {
  const formData = new FormData();

  // Extraction du nom de fichier depuis l'URI si non fourni
  const filename = file.name || file.uri.split("/").pop() || "upload.jpg";

  // Déduction du type MIME selon l'extension si non fourni
  const match = /\.(\w+)$/.exec(filename);
  const type = file.type || (match ? `image/${match[1]}` : "image/jpeg");

  // Format React Native obligatoire : { uri, name, type }
  formData.append(fieldName, {
    uri: file.uri,
    name: filename,
    type: type,
  } as any);

  return formData;
}

// --- FONCTIONS DE TÉLÉVERSEMENT (MOBILE) ---

/**
 * Envoie une couverture d'histoire au serveur backend
 */
export async function uploadStoryCoverMobile(storyId: string, file: MobileImageFile) {
  const formData = createFormData(file, "cover");

  const response = await api.post<{ coverUrl: string }>(
    `/stories/${storyId}/cover`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

/**
 * Envoie un avatar utilisateur au serveur backend
 */
export async function uploadUserAvatarMobile(file: MobileImageFile) {
  const formData = createFormData(file, "avatar");

  const response = await api.post<{ avatarUrl: string }>(
    `/users/me/avatar`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}