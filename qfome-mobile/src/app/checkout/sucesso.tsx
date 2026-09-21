import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, House, MapPinned, UserRound } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { Button, SurfaceCard, WhiteCard } from "@/components/ui";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

/** Confirmacao do pedido — equivale a `/checkout/sucesso`. */
export default function CheckoutSucessoScreen() {
  const router = useRouter();
  const { codigo } = useLocalSearchParams<{ codigo?: string }>();
  const orderCode = typeof codigo === "string" && codigo ? codigo : "QF-SEM-CODIGO";

  return (
    <Screen>
      <SurfaceCard style={styles.card}>
        <View style={styles.successIcon}>
          <CheckCircle2 size={30} color={colors.success} />
        </View>

        <Text style={styles.eyebrow}>PEDIDO CONFIRMADO</Text>
        <Text style={styles.title}>Sucesso no checkout</Text>
        <Text style={styles.lead}>
          Recebemos seu pedido. A cozinha ja iniciou a preparacao e em breve ele sai para
          entrega.
        </Text>

        <WhiteCard style={styles.codeCard}>
          <Text style={styles.codeLabel}>CODIGO DO PEDIDO</Text>
          <Text style={styles.codeValue}>{orderCode}</Text>
        </WhiteCard>

        <View style={styles.actions}>
          <Button
            label="Acompanhar"
            icon={<MapPinned size={15} color={colors.white} />}
            onPress={() => router.push(`/acompanhar-pedido?codigo=${orderCode}`)}
          />
          <Button
            label="Area do cliente"
            variant="outline"
            icon={<UserRound size={15} color="#7a3f33" />}
            onPress={() => router.push("/cliente")}
          />
          <Button
            label="Voltar para home"
            variant="outline"
            icon={<House size={15} color="#7a3f33" />}
            onPress={() => router.push("/")}
          />
        </View>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingVertical: 28,
  },
  successIcon: {
    height: 58,
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.successBg,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
    marginTop: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 42,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 6,
    textAlign: "center",
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.body,
    textAlign: "center",
    marginTop: 10,
  },
  codeCard: {
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 18,
    gap: 4,
  },
  codeLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  codeValue: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: colors.price,
  },
  actions: {
    alignSelf: "stretch",
    gap: 8,
    marginTop: 20,
  },
});
