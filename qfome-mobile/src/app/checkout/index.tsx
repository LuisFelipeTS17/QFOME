import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Banknote, CreditCard, QrCode, ShoppingBag, Truck } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { BrandText } from "@/components/brand-text";
import { Field } from "@/components/field";
import {
  BackButton,
  Button,
  DarkCard,
  DarkPanel,
  FeedbackBox,
  SummaryRow,
  SurfaceCard,
} from "@/components/ui";
import { formatPrice } from "@/lib/format";
import {
  clearOrderItems,
  readOrderItems,
  readUser,
  saveOrder,
  saveUser,
  type OrderItem,
  type PaymentMethod,
} from "@/lib/storage";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

const paymentOptions: { id: PaymentMethod; label: string; Icon: typeof QrCode }[] = [
  { id: "pix", label: "Pix", Icon: QrCode },
  { id: "cartao", label: "Cartao", Icon: CreditCard },
  { id: "dinheiro", label: "Dinheiro", Icon: Banknote },
];

const paymentCopy: Record<PaymentMethod, { title: string; description: string }> = {
  cartao: {
    title: "Pagamento com cartao",
    description: "Aceitamos cartao de credito e debito direto na entrega.",
  },
  pix: {
    title: "Pagamento com Pix",
    description: "Apos confirmar, exibimos o QR Code para pagamento instantaneo.",
  },
  dinheiro: {
    title: "Pagamento em dinheiro",
    description: "Informe o valor do troco e pague na entrega com praticidade.",
  },
};

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  district: "",
  complement: "",
  changeFor: "",
};

/** Finalizacao do pedido — equivale a `/checkout` do site, com busca de CEP. */
export default function CheckoutScreen() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState(emptyForm);
  const cepTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      Promise.all([readOrderItems(), readUser()]).then(([savedItems, savedUser]) => {
        if (!active) {
          return;
        }
        setItems(savedItems);
        if (savedUser) {
          setForm((current) => ({
            ...current,
            fullName: current.fullName || savedUser.name,
            email: current.email || savedUser.email,
            phone: current.phone || savedUser.phone || "",
          }));
        }
      });

      return () => {
        active = false;
      };
    }, []),
  );

  // Preenchimento automatico de endereco via ViaCEP, como no site.
  useEffect(() => {
    const cepLimpo = form.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return;
    }

    if (cepTimeout.current) {
      clearTimeout(cepTimeout.current);
    }

    cepTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (data.erro) {
          return;
        }
        setForm((prev) => ({
          ...prev,
          street: data.logradouro ?? prev.street,
          district: data.bairro ?? prev.district,
        }));
      } catch {
        // CEP invalido ou sem conexao: o formulario continua editavel.
      }
    }, 400);

    return () => {
      if (cepTimeout.current) {
        clearTimeout(cepTimeout.current);
      }
    };
  }, [form.cep]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0),
    [items],
  );
  const delivery = subtotal > 0 && subtotal < 45 ? 6.9 : 0;
  const total = subtotal + delivery;

  const updateField = (key: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (feedback) {
      setFeedback("");
    }
  };

  const finalizeOrder = async () => {
    if (items.length === 0) {
      setFeedback("Seu carrinho esta vazio. Adicione pratos antes de finalizar.");
      return;
    }

    const required = [
      form.fullName,
      form.email,
      form.phone,
      form.cep,
      form.street,
      form.number,
      form.district,
    ];

    if (required.some((value) => !value.trim())) {
      setFeedback("Preencha os campos obrigatorios para concluir o pedido.");
      return;
    }

    const orderCode = `QF-${Date.now().toString().slice(-6)}`;
    const estimatedMinutes = Math.max(24, Math.min(48, 20 + items.length * 4));

    await saveOrder({
      code: orderCode,
      createdAt: new Date().toISOString(),
      paymentMethod,
      total,
      deliveryFee: delivery,
      status: "recebido",
      estimatedMinutes,
      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      deliveryAddress: {
        cep: form.cep.trim(),
        street: form.street.trim(),
        number: form.number.trim(),
        district: form.district.trim(),
        complement: form.complement.trim(),
      },
      items,
    });

    await saveUser({
      name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    await clearOrderItems();

    setItems([]);
    router.push(`/checkout/sucesso?codigo=${orderCode}`);
  };

  const copy = paymentCopy[paymentMethod];

  return (
    <Screen>
      <BackButton label="Voltar" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>CHECKOUT</Text>
        <Text style={styles.title}>Finalizar pedido</Text>
        <Text style={styles.lead}>Preencha seus dados para concluir entrega e pagamento.</Text>

        <View style={styles.formBlock}>
          <Field
            label="Nome completo *"
            value={form.fullName}
            onChangeText={updateField("fullName")}
            autoComplete="name"
          />
          <Field
            label="E-mail *"
            value={form.email}
            onChangeText={updateField("email")}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Telefone *"
            value={form.phone}
            onChangeText={updateField("phone")}
            keyboardType="phone-pad"
          />
          <Field
            label="CEP *"
            value={form.cep}
            onChangeText={updateField("cep")}
            keyboardType="number-pad"
            maxLength={9}
          />
          <Field label="Rua *" value={form.street} onChangeText={updateField("street")} />
          <View style={styles.row}>
            <Field
              label="Numero *"
              value={form.number}
              onChangeText={updateField("number")}
              keyboardType="number-pad"
              style={styles.flexInput}
            />
          </View>
          <Field label="Bairro *" value={form.district} onChangeText={updateField("district")} />
          <Field
            label="Complemento"
            value={form.complement}
            onChangeText={updateField("complement")}
          />
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.blockLabel}>FORMA DE PAGAMENTO</Text>
          <View style={styles.paymentRow}>
            {paymentOptions.map(({ id, label, Icon }) => {
              const isActive = paymentMethod === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setPaymentMethod(id)}
                  style={[styles.paymentOption, isActive && styles.paymentOptionActive]}
                >
                  <Icon size={15} color={isActive ? "#7b3024" : "#7f4a3c"} />
                  <Text style={[styles.paymentLabel, isActive && styles.paymentLabelActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.paymentCopy}>
            <Text style={styles.paymentTitle}>{copy.title}</Text>
            <Text style={styles.paymentDescription}>{copy.description}</Text>
          </View>

          {paymentMethod === "dinheiro" ? (
            <Field
              label="Troco para quanto?"
              value={form.changeFor}
              onChangeText={updateField("changeFor")}
              keyboardType="numeric"
            />
          ) : null}
        </View>

        <Button
          label="Confirmar pedido"
          icon={<Truck size={16} color={colors.white} />}
          onPress={finalizeOrder}
          style={styles.submit}
        />

        <View style={styles.feedbackSlot}>
          <FeedbackBox message={feedback} />
        </View>
      </SurfaceCard>

      {/* Resumo */}
      <DarkPanel eyebrow="Resumo do pedido" title="CHECKOUT">
        {items.length === 0 ? (
          <DarkCard style={styles.panelBlock}>
            <Text style={styles.panelText}>Nenhum item no pedido.</Text>
            <Button
              label="Ir para cardapio"
              variant="gold"
              icon={<ShoppingBag size={14} color={colors.panelActionInk} />}
              onPress={() => router.push("/cardapio")}
              style={styles.panelButton}
            />
          </DarkCard>
        ) : (
          <View style={styles.panelList}>
            {items.map((item, index) => (
              <DarkCard key={`${item.slug}-${item.addedAt}-${index}`}>
                <BrandText text={item.name} style={styles.panelStrong} />
                <Text style={styles.panelText}>Quantidade: {item.quantity}</Text>
                <Text style={styles.panelValue}>
                  {formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}
                </Text>
              </DarkCard>
            ))}
          </View>
        )}

        <DarkCard style={styles.panelBlock}>
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} dark />
          <SummaryRow
            label="Entrega"
            value={delivery > 0 ? formatPrice(delivery) : "Gratis"}
            dark
          />
          <SummaryRow label="Total" value={formatPrice(total)} emphasis dark />
        </DarkCard>

        <Button
          label="Voltar para carrinho"
          variant="ghostDark"
          onPress={() => router.push("/pedido")}
          style={styles.panelButton}
        />
      </DarkPanel>
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
    lineHeight: 42,
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
  formBlock: {
    gap: 8,
    marginTop: 18,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  flexInput: {
    flex: 1,
  },
  paymentCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    padding: 14,
    marginTop: 16,
    gap: 12,
  },
  blockLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  paymentRow: {
    flexDirection: "row",
    gap: 8,
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 10,
  },
  paymentOptionActive: {
    borderColor: colors.brand,
    backgroundColor: "#fff1ec",
  },
  paymentLabel: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: "#7f4a3c",
  },
  paymentLabelActive: {
    color: "#7b3024",
  },
  paymentCopy: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: "#fff9f6",
    padding: 12,
    gap: 4,
  },
  paymentTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: "#6a3327",
  },
  paymentDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.body,
  },
  submit: {
    marginTop: 16,
  },
  feedbackSlot: {
    marginTop: 12,
  },
  panelList: {
    gap: 8,
    marginTop: 14,
  },
  panelBlock: {
    marginTop: 14,
  },
  panelStrong: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.white,
  },
  panelText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.panelInkSoft,
  },
  panelValue: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors.panelGold,
    marginTop: 4,
  },
  panelButton: {
    marginTop: 14,
  },
});
