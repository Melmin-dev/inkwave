import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LibraryScreen from "../screens/LibraryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import StoryDetailScreen from "../screens/StoryDetailScreen";
import ReaderScreen from "../screens/ReaderScreen";
import WriteStoryScreen from "../screens/WriteStoryScreen";
import EditChapterScreen from "../screens/EditChapterScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Icônes textuelles simples pour éviter une dépendance supplémentaire (vector-icons est déjà
// inclus avec Expo si vous préférez le remplacer par des icônes SVG plus tard).
function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.ink700 }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ title: "InkWave" }} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} options={{ title: "Histoire" }} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ title: "Lecture" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil" }} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.ink700 }}>
      <Stack.Screen name="SearchHome" component={SearchScreen} options={{ title: "Découvrir" }} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} options={{ title: "Histoire" }} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ title: "Lecture" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil" }} />
    </Stack.Navigator>
  );
}

function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.ink700 }}>
      <Stack.Screen name="LibraryHome" component={LibraryScreen} options={{ title: "Bibliothèque" }} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} options={{ title: "Histoire" }} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ title: "Lecture" }} />
      <Stack.Screen name="WriteStory" component={WriteStoryScreen} options={{ title: "Écrire" }} />
      <Stack.Screen name="EditChapter" component={EditChapterScreen} options={{ title: "Chapitre" }} />
      <Stack.Screen name="Auth" component={LoginScreen} options={{ title: "Connexion" }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.ink700 }}>
      {user ? (
        <Stack.Screen
          name="MyProfile"
          component={ProfileScreen}
          options={{ title: "Mon profil" }}
          initialParams={{ username: user.username }}
        />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Connexion" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Inscription" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.ink600 }}>
      <Tab.Screen name="Home" component={HomeStack} options={{ title: "Accueil", tabBarIcon: () => <TabIcon emoji="🏠" /> }} />
      <Tab.Screen name="Search" component={SearchStack} options={{ title: "Découvrir", tabBarIcon: () => <TabIcon emoji="🔍" /> }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ title: "Bibliothèque", tabBarIcon: () => <TabIcon emoji="📚" /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: "Profil", tabBarIcon: () => <TabIcon emoji="👤" /> }} />
    </Tab.Navigator>
  );
}

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
