import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Mail, ShieldCheck } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { Field } from "@/components/field";
import { BackButton, Button, FeedbackBox, SurfaceCard } from "@/components/ui";
import { readSessao } from "@/lib/session";
import { colors } from "@/theme/colors";
import { fonts, tracking } from "@/theme/typography";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

/** Recuperacao de acesso — equivale a `/recuperar-acesso`. */
export default function RecuperarAcessoScreen() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleRecovery = async () => {
    const storedUser = await readSessao();

    if (!storedUser) {
      setFeedback("Nenhuma conta conectada neste aparelho. Entre ou crie sua conta para continuar.");
      return;
    }

    if (normalizeEmail(storedUser.email) !== normalizeEmail(email)) {
      setFeedback("E-mail nao encontrado. Confira o e-mail informado.");
      return;
    }

    setFeedback(
      `Pronto! Encontramos sua conta (${storedUser.nome}). No backend, aqui entra o envio real do link de recuperacao.`,
    );
  };

  return (
    <Screen>
      <BackButton label="Voltar para login" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>RECUPERAR ACESSO</Text>
        <Text style={styles.title}>Esqueceu seu login?</Text>
        <Text style={styles.lead}>
          Informe seu e-mail para recuperar o acesso da sua conta.
        </Text>

        <View style={styles.form}>
          <Field
            icon={<Mail size={16} color="#8b5145" />}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setFeedback("");
            }}
            placeholder="Digite seu e-mail de cadastro"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            label="Recuperar acesso"
            icon={<ShieldCheck size={16} color={colors.white} />}
            onPress={handleRecovery}
          />
        </View>

        <View style={styles.feedbackSlot}>
          <FeedbackBox message={feedback} />
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
  form: {
    gap: 10,
    marginTop: 18,
  },
  feedbackSlot: {
    marginTop: 14,
  },
});
