import { Platform, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { House, UserRound, UtensilsCrossed, ShoppingBag } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { fonts, tracking } from "@/theme/typography";

/**
 * Navegacao principal. No site esse papel e do menu do header
 * (Inicio / Cardapio / Meu pedido / Conta); no mobile vira tab bar.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: "#a3796c",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <House size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cardapio"
        options={{
          title: "Cardapio",
          tabBarIcon: ({ color }) => <UtensilsCrossed size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pedido"
        options={{
          title: "Pedido",
          tabBarIcon: ({ color }) => <ShoppingBag size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cliente"
        options={{
          title: "Conta",
          tabBarIcon: ({ color }) => <UserRound size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    height: Platform.select({ ios: 86, default: 64 }),
    paddingTop: 6,
  },
  tabItem: {
    paddingVertical: 2,
  },
  tabLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: tracking.button,
    textTransform: "uppercase",
  },
});
