import { StyleSheet, Text, View } from "react-native";
import { Clock3, Mail, MapPin, Phone, type LucideIcon } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { BrandText } from "@/components/brand-text";
import { BackButton, SurfaceCard, WhiteCard } from "@/components/ui";
import { colors } from "@/theme/colors";
import { fonts, tracking } from "@/theme/typography";

const channels: { Icon: LucideIcon; label: string; value: string }[] = [
  { Icon: Phone, label: "Telefone", value: "(11) 3000-0000" },
  { Icon: Mail, label: "E-mail", value: "contato@qfome.com.br" },
  { Icon: Clock3, label: "Atendimento", value: "Todos os dias, das 10h as 23h" },
  { Icon: MapPin, label: "Area de entrega", value: "18 bairros na regiao metropolitana" },
];

/** Canais de atendimento — equivale a `/contato`. */
export default function ContatoScreen() {
  return (
    <Screen>
      <BackButton label="Voltar" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>CONTATO</Text>
        <BrandText text="Fale com a QFome" style={styles.title} />
        <Text style={styles.lead}>
          Estamos aqui para ajudar com pedidos, suporte e parcerias.
        </Text>

        <View style={styles.grid}>
          {channels.map(({ Icon, label, value }) => (
            <WhiteCard key={label} style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <Icon size={16} color="#61261d" />
                <Text style={styles.channelLabel}>{label}</Text>
              </View>
              <Text style={styles.channelValue}>{value}</Text>
            </WhiteCard>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.eyebrow}>CLUBE QFOME</Text>
        <Text style={styles.title}>Promocoes & cupons</Text>
        <Text style={styles.lead}>
          Cupom de boas-vindas: QFOME10. Use no checkout e ganhe desconto no primeiro pedido.
        </Text>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 40,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 4,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.body,
    marginTop: 10,
  },
  grid: {
    gap: 10,
    marginTop: 18,
  },
  channelCard: {
    gap: 6,
  },
  channelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  channelLabel: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: "#61261d",
  },
  channelValue: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.body,
  },
});
