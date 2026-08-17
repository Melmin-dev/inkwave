import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await login(emailOrUsername, password);
    } catch (err: any) {
      Alert.alert("Erreur", err.response?.data?.error || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.logo}>InkWave</Text>
      <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

      <TextInput
        style={styles.input}
        placeholder="Email ou nom d'utilisateur"
        autoCapitalize="none"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Connexion..." : "Se connecter"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Démo : alice_writes / password123</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.white },
  logo: { fontSize: 32, fontWeight: "bold", color: colors.ink700, textAlign: "center", marginBottom: 4 },
  subtitle: { textAlign: "center", color: colors.neutral500, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: colors.neutral200, borderRadius: 10, padding: 12, marginBottom: 12 },
  button: { backgroundColor: colors.ink600, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "white", fontWeight: "600" },
  link: { textAlign: "center", color: colors.ink600, marginTop: 16, fontWeight: "500" },
  hint: { textAlign: "center", color: colors.neutral400, marginTop: 20, fontSize: 12 },
});
