import { ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { AdminProvider, useAdmin } from "@/components/admin-provider";
import { Screen } from "@/components/screen";
import { colors } from "@/theme/colors";

/**
 * Area administrativa, aberta pelo login de um administrador ou pelo endereco `/admin`.
 * Sem login, qualquer endereco dela leva para a tela de entrada.
 */
export default function AdminLayout() {
  return (
    <AdminProvider>
      <AdminStack />
    </AdminProvider>
  );
}

function AdminStack() {
  const { admin, carregando } = useAdmin();

  // So decide a tela depois de ler a sessao salva, para quem ja entrou nao ver o login.
  if (carregando) {
    return (
      <Screen>
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Protected guard={admin !== null}>
        <Stack.Screen name="index" />
        <Stack.Screen name="pratos" />
        <Stack.Screen name="prato/[id]" />
        <Stack.Screen name="exportar" />
      </Stack.Protected>
      <Stack.Protected guard={admin === null}>
        <Stack.Screen name="entrar" />
      </Stack.Protected>
    </Stack>
  );
}
