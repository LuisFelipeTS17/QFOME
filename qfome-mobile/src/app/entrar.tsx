import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { Field } from "@/components/field";
import { BackButton, Button, FeedbackBox, SurfaceCard } from "@/components/ui";
import { saveUser } from "@/lib/storage";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

type Tab = "login" | "signup";

/**
 * Login e cadastro — equivale a `/entrar`. A sessao e gravada localmente;
 * trocar por `login()`/`register()` de `@/lib/api` liga no backend.
 */
export default function EntrarScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [feedback, setFeedback] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setFeedback("Preencha e-mail e senha para entrar.");
      return;
    }

    const email = loginEmail.trim().toLowerCase();
    await saveUser({ name: email.split("@")[0], email });
    setFeedback("Login realizado. Redirecionando para sua area de cliente...");
    router.push("/cliente");
  };

  const handleSignup = async () => {
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setFeedback("Preencha nome, e-mail e senha para criar sua conta.");
      return;
    }

    await saveUser({
      name: signupName.trim(),
      email: signupEmail.trim().toLowerCase(),
      phone: signupPhone.trim(),
    });
    setFeedback("Conta criada com sucesso. Redirecionando para sua area de cliente...");
    router.push("/cliente");
  };

  return (
    <Screen>
      <BackButton label="Voltar" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>ACESSO</Text>
        <Text style={styles.title}>Entrar ou criar conta</Text>
        <Text style={styles.lead}>
          Faca login para acompanhar pedidos ou crie sua conta para receber ofertas.
        </Text>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => {
              setTab("login");
              setFeedback("");
            }}
            style={[styles.tab, tab === "login" && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === "login" && styles.tabLabelActive]}>
              ENTRAR
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setTab("signup");
              setFeedback("");
            }}
            style={[styles.tab, tab === "signup" && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === "signup" && styles.tabLabelActive]}>
              CRIAR CONTA
            </Text>
          </Pressable>
        </View>

        {tab === "login" ? (
          <View style={styles.form}>
            <Field
              icon={<Mail size={16} color="#8b5145" />}
              value={loginEmail}
              onChangeText={(value) => {
                setLoginEmail(value);
                setFeedback("");
              }}
              placeholder="Seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              icon={<LockKeyhole size={16} color="#8b5145" />}
              value={loginPassword}
              onChangeText={(value) => {
                setLoginPassword(value);
                setFeedback("");
              }}
              placeholder="Sua senha"
              secureTextEntry
            />
            <Pressable
              onPress={() => router.push("/recuperar-acesso")}
              style={styles.forgotWrapper}
            >
              <Text style={styles.forgotLabel}>ESQUECEU SEU LOGIN?</Text>
            </Pressable>
            <Button label="Entrar na conta" onPress={handleLogin} />
          </View>
        ) : (
          <View style={styles.form}>
            <Field
              icon={<UserRound size={16} color="#8b5145" />}
              value={signupName}
              onChangeText={(value) => {
                setSignupName(value);
                setFeedback("");
              }}
              placeholder="Nome completo"
            />
            <Field
              icon={<Mail size={16} color="#8b5145" />}
              value={signupEmail}
              onChangeText={(value) => {
                setSignupEmail(value);
                setFeedback("");
              }}
              placeholder="Seu melhor e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              icon={<Phone size={16} color="#8b5145" />}
              value={signupPhone}
              onChangeText={(value) => {
                setSignupPhone(value);
                setFeedback("");
              }}
              placeholder="Telefone (opcional)"
              keyboardType="phone-pad"
            />
            <Field
              icon={<LockKeyhole size={16} color="#8b5145" />}
              value={signupPassword}
              onChangeText={(value) => {
                setSignupPassword(value);
                setFeedback("");
              }}
              placeholder="Crie uma senha"
              secureTextEntry
            />
            <Button label="Criar conta" onPress={handleSignup} />
          </View>
        )}

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
  tabs: {
    flexDirection: "row",
    gap: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    padding: 4,
    marginTop: 18,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    borderRadius: radius.sm,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: colors.brand,
  },
  tabLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 11.5,
    letterSpacing: tracking.button,
    color: "#7f473b",
  },
  tabLabelActive: {
    color: colors.white,
  },
  form: {
    gap: 10,
    marginTop: 18,
  },
  forgotWrapper: {
    alignSelf: "flex-end",
  },
  forgotLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 10.5,
    letterSpacing: tracking.button,
    color: "#c72035",
  },
  feedbackSlot: {
    marginTop: 14,
  },
});
