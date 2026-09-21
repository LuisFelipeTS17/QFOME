import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { colors } from "@/theme/colors";

// Mantem o splash bordo visivel ate Bebas Neue e Manrope carregarem,
// evitando um flash de texto com a fonte do sistema.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Em alguns ambientes (web) o splash ja foi tratado; seguir sem bloquear.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const ready = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        // idem: falha ao esconder nao deve derrubar o app.
      });
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="categoria/[slug]" />
        <Stack.Screen name="produto/[slug]" />
        <Stack.Screen name="checkout/index" />
        <Stack.Screen name="checkout/sucesso" />
        <Stack.Screen name="acompanhar-pedido" />
        <Stack.Screen name="entrar" />
        <Stack.Screen name="contato" />
        <Stack.Screen name="recuperar-acesso" />
      </Stack>
    </SafeAreaProvider>
  );
}
