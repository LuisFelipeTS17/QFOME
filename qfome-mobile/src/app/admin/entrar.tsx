import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LockKeyhole, Mail } from "lucide-react-native";
import { larguraAdmin } from "@/components/admin-menu";
import { useAdmin } from "@/components/admin-provider";
import { Field } from "@/components/field";
import { Screen } from "@/components/screen";
import { Button, FeedbackBox, SurfaceCard } from "@/components/ui";
import { colors } from "@/theme/colors";
import { fonts, tracking } from "@/theme/typography";

/** Login administrativo: so contas com o perfil ADMIN entram. */
export default function AdminEntrarScreen() {
  const { entrar, aviso } = useAdmin();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [feedback, setFeedback] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!email.trim() || !senha) {
      setFeedback("Preencha e-mail e senha para entrar.");
      return;
    }

    setEnviando(true);
    setFeedback("");
    try {
      // Com a sessao aberta, o layout troca esta tela pelo painel.
      await entrar(email.trim().toLowerCase(), senha);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel entrar agora.");
      setEnviando(false);
    }
  };

  return (
    <Screen contentStyle={larguraAdmin}>
      <SurfaceCard>
        <Text style={styles.eyebrow}>AREA ADMINISTRATIVA</Text>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.lead}>Acesso restrito aos administradores do QFOME.</Text>

        <View style={styles.form}>
          <Field
            icon={<Mail size={16} color="#8b5145" />}
            value={email}
            onChangeText={(valor) => {
              setEmail(valor);
              setFeedback("");
            }}
            placeholder="E-mail do administrador"
            accessibilityLabel="E-mail do administrador"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            icon={<LockKeyhole size={16} color="#8b5145" />}
            value={senha}
            onChangeText={(valor) => {
              setSenha(valor);
              setFeedback("");
            }}
            placeholder="Senha"
            accessibilityLabel="Senha do administrador"
            secureTextEntry
            autoComplete="current-password"
            onSubmitEditing={enviar}
          />
          <Button
            label={enviando ? "Entrando..." : "Entrar"}
            icon={<LockKeyhole size={15} color={colors.white} />}
            onPress={enviar}
            disabled={enviando}
          />
        </View>

        <View style={styles.feedbackSlot}>
          <FeedbackBox message={feedback || aviso} />
        </View>
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
    fontSize: 44,
    lineHeight: 44,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 4,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.body,
    marginTop: 8,
  },
  form: {
    gap: 10,
    marginTop: 18,
  },
  feedbackSlot: {
    marginTop: 12,
  },
});
