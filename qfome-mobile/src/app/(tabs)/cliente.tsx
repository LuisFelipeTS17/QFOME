import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Clock3, MapPin, ShoppingBag, UserRound } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { Button, DarkCard, DarkPanel, SurfaceCard, WhiteCard } from "@/components/ui";
import { formatDateTime, formatPrice } from "@/lib/format";
import {
  clearUser,
  readOrderItems,
  readOrderHistory,
  readLastOrder,
  readUser,
  type OrderItem,
  type OrderRecord,
  type UserProfile,
} from "@/lib/storage";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

const statusLabel: Record<string, string> = {
  recebido: "Recebido",
  em_preparo: "Em preparo",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
};

/** Area do cliente — perfil, historico e resumo rapido (rota `/cliente`). */
export default function ClienteScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<OrderRecord[]>([]);
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      Promise.all([readUser(), readOrderHistory(), readLastOrder(), readOrderItems()]).then(
        ([savedUser, savedHistory, savedLast, savedCart]) => {
          if (!active) {
            return;
          }
          setUser(savedUser);
          setHistory(savedHistory);
          setLastOrder(savedLast);
          setCartItems(savedCart);
          setLoaded(true);
        },
      );

      return () => {
        active = false;
      };
    }, []),
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0),
    [cartItems],
  );

  const recentOrders = useMemo(() => history.slice(0, 6), [history]);
  const latestOrder = recentOrders[0] ?? lastOrder;

  const handleLogout = async () => {
    await clearUser();
    setUser(null);
    router.push("/entrar");
  };

  if (!loaded) {
    return <Screen bottomInset={24}>{null}</Screen>;
  }

  if (!user) {
    return (
      <Screen bottomInset={24}>
        <SurfaceCard style={styles.loggedOut}>
          <Text style={styles.loggedOutText}>Voce ainda nao tem uma conta ativa.</Text>
          <Button
            label="Entrar ou criar conta"
            icon={<UserRound size={15} color={colors.white} />}
            onPress={() => router.push("/entrar")}
          />
        </SurfaceCard>
      </Screen>
    );
  }

  return (
    <Screen bottomInset={24}>
      <SurfaceCard>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>AREA DO CLIENTE</Text>
            <Text style={styles.title}>Ola, {user.name.split(" ")[0]}</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
          >
            <Text style={styles.logoutLabel}>Sair</Text>
          </Pressable>
        </View>

        <Text style={styles.lead}>Gerencie seus pedidos e acompanhe seu checkout.</Text>

        <View style={styles.profileGrid}>
          <WhiteCard style={styles.profileCard}>
            <Text style={styles.fieldLabel}>NOME</Text>
            <Text style={styles.fieldValue}>{user.name}</Text>
          </WhiteCard>
          <WhiteCard style={styles.profileCard}>
            <Text style={styles.fieldLabel}>E-MAIL</Text>
            <Text style={styles.fieldValue}>{user.email}</Text>
          </WhiteCard>
          <WhiteCard style={styles.profileCard}>
            <Text style={styles.fieldLabel}>TELEFONE</Text>
            <Text style={styles.fieldValue}>
              {user.phone?.trim() ? user.phone : "Nao informado"}
            </Text>
          </WhiteCard>
        </View>

        <View style={styles.quickActions}>
          <Button
            label="Cardapio"
            variant="outline"
            onPress={() => router.push("/cardapio")}
            style={styles.flex}
          />
          <Button
            label="Carrinho"
            variant="outline"
            onPress={() => router.push("/pedido")}
            style={styles.flex}
          />
        </View>
        <Button label="Ir para checkout" onPress={() => router.push("/checkout")} />

        <WhiteCard style={styles.historyCard}>
          <Text style={styles.fieldLabel}>HISTORICO DE PEDIDOS</Text>

          {recentOrders.length === 0 ? (
            <Text style={styles.emptyHistory}>Nenhum pedido finalizado ainda.</Text>
          ) : (
            <View style={styles.historyList}>
              {recentOrders.map((order) => (
                <View key={`${order.code}-${order.createdAt}`} style={styles.historyRow}>
                  <View style={styles.flex}>
                    <Text style={styles.historyCode}>{order.code}</Text>
                    <Text style={styles.historyDate}>{formatDateTime(order.createdAt)}</Text>
                    <Text style={styles.historyStatus}>
                      {statusLabel[order.status ?? "recebido"] ?? "Recebido"}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyTotal}>{formatPrice(order.total)}</Text>
                    <Pressable
                      onPress={() => router.push(`/acompanhar-pedido?codigo=${order.code}`)}
                    >
                      <Text style={styles.historyLink}>ACOMPANHAR</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </WhiteCard>
      </SurfaceCard>

      <DarkPanel eyebrow="Resumo rapido" title="SEUS PEDIDOS">
        <DarkCard style={styles.panelCard}>
          <Text style={styles.panelLabel}>CARRINHO ATUAL</Text>
          <Text style={styles.panelText}>{cartItems.length} itens no momento</Text>
          <Text style={styles.panelValue}>{formatPrice(cartTotal)}</Text>
        </DarkCard>

        {latestOrder ? (
          <DarkCard style={styles.panelCard}>
            <Text style={styles.panelLabel}>ULTIMO PEDIDO</Text>
            <Text style={styles.panelStrong}>Codigo {latestOrder.code}</Text>
            <View style={styles.panelMetaRow}>
              <Clock3 size={13} color={colors.panelInkSoft} />
              <Text style={styles.panelText}>{formatDateTime(latestOrder.createdAt)}</Text>
            </View>
            <View style={styles.panelMetaRow}>
              <MapPin size={13} color={colors.panelInkSoft} />
              <Text style={styles.panelText}>
                {statusLabel[latestOrder.status ?? "recebido"] ?? "Recebido"}
              </Text>
            </View>
            <Text style={styles.panelValue}>{formatPrice(latestOrder.total)}</Text>
            <Pressable
              onPress={() => router.push(`/acompanhar-pedido?codigo=${latestOrder.code}`)}
            >
              <Text style={styles.panelLink}>ACOMPANHAR PEDIDO</Text>
            </Pressable>
          </DarkCard>
        ) : (
          <DarkCard style={styles.panelCard}>
            <Text style={styles.panelText}>Voce ainda nao finalizou um pedido.</Text>
          </DarkCard>
        )}

        <Button
          label="Finalizar agora"
          variant="gold"
          icon={<ShoppingBag size={15} color={colors.panelActionInk} />}
          onPress={() => router.push("/checkout")}
          style={styles.panelButton}
        />
      </DarkPanel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loggedOut: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 26,
  },
  loggedOutText: {
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    textAlign: "center",
    color: "#7b473d",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 42,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 4,
  },
  logout: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f0cabd",
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logoutLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brand,
  },
  pressed: {
    opacity: 0.8,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.body,
    marginTop: 8,
  },
  profileGrid: {
    gap: 8,
    marginTop: 16,
  },
  profileCard: {
    gap: 3,
  },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  fieldValue: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: "#5b2c24",
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  historyCard: {
    marginTop: 18,
    gap: 10,
  },
  emptyHistory: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#825247",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f2ddd4",
    backgroundColor: "#fff9f6",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f2ddd4",
    backgroundColor: "#fff9f6",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  historyCode: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: "#5b2c24",
  },
  historyDate: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: "#8a5d52",
  },
  historyStatus: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: "#a04d3f",
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  historyTotal: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: colors.price,
  },
  historyLink: {
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.brand,
  },
  panelCard: {
    marginTop: 12,
    gap: 4,
  },
  panelLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: colors.panelInkSoft,
  },
  panelText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.panelInkSoft,
  },
  panelStrong: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.white,
  },
  panelMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  panelValue: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
    color: colors.panelGold,
    marginTop: 4,
  },
  panelLink: {
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: "#ffcd88",
    marginTop: 8,
  },
  panelButton: {
    marginTop: 14,
  },
});
