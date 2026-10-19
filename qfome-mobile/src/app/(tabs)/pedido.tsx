import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ShoppingBag, Trash2 } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { BrandText } from "@/components/brand-text";
import { Button, EmptyState, SummaryRow, SurfaceCard, WhiteCard } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { calcularTaxaEntrega } from "@/lib/pedido";
import { clearOrderItems, readOrderItems, saveOrderItems, type OrderItem } from "@/lib/storage";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

/** Carrinho editavel — equivale a rota `/pedido` do site. */
export default function PedidoScreen() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      readOrderItems().then((saved) => {
        if (active) {
          setItems(saved);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0),
    [items],
  );
  const delivery = calcularTaxaEntrega(subtotal);
  const total = subtotal + delivery;

  const removeItem = async (index: number) => {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    setItems(next);
    await saveOrderItems(next);
  };

  const clearOrder = async () => {
    setItems([]);
    await clearOrderItems();
  };

  return (
    <Screen bottomInset={24}>
      <SurfaceCard>
        <Text style={styles.eyebrow}>MEU PEDIDO</Text>
        <Text style={styles.title}>Carrinho</Text>

        {items.length > 0 ? (
          <View style={styles.actionsRow}>
            <Button
              label="Ir para checkout"
              icon={<ShoppingBag size={14} color={colors.white} />}
              onPress={() => router.push("/checkout")}
              style={styles.flexButton}
            />
            <Button
              label="Limpar"
              variant="outline"
              icon={<Trash2 size={14} color="#7a3f33" />}
              onPress={clearOrder}
              style={styles.clearButton}
            />
          </View>
        ) : null}

        {items.length === 0 ? (
          <EmptyState
            message="Seu pedido ainda esta vazio."
            action={
              <Button
                label="Ir para cardapio"
                icon={<ShoppingBag size={14} color={colors.white} />}
                onPress={() => router.push("/cardapio")}
              />
            }
          />
        ) : (
          <View style={styles.list}>
            {items.map((item, index) => (
              <WhiteCard key={`${item.productId}-${item.addedAt}-${index}`} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemHeaderText}>
                    <BrandText text={item.name} style={styles.itemName} />
                    <Text style={styles.itemMeta}>Quantidade: {item.quantity}</Text>
                    {item.note ? <Text style={styles.itemNote}>Obs.: {item.note}</Text> : null}
                  </View>
                  <Pressable
                    onPress={() => removeItem(index)}
                    style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.removeLabel}>Remover</Text>
                  </Pressable>
                </View>

                {item.extras?.length ? (
                  <View style={styles.extras}>
                    {item.extras.map((extra) => (
                      <Text key={`${item.productId}-${extra.id}`} style={styles.extraText}>
                        + {extra.name} ({formatPrice(extra.price)})
                      </Text>
                    ))}
                  </View>
                ) : null}

                <Text style={styles.itemTotal}>
                  {formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}
                </Text>
              </WhiteCard>
            ))}
          </View>
        )}

        <WhiteCard style={styles.summary}>
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow label="Entrega" value={delivery > 0 ? formatPrice(delivery) : "Gratis"} />
          <SummaryRow label="Total" value={formatPrice(total)} emphasis />
        </WhiteCard>
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
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  flexButton: {
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 14,
  },
  list: {
    gap: 10,
    marginTop: 16,
  },
  itemCard: {
    gap: 8,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  itemHeaderText: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: "#61261d",
  },
  itemMeta: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: "#83554a",
  },
  itemNote: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: "#9a5f52",
    marginTop: 2,
  },
  removeButton: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  removeLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: "#7b3f34",
  },
  pressed: {
    opacity: 0.8,
  },
  extras: {
    gap: 2,
  },
  extraText: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: "#754438",
  },
  itemTotal: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
    color: colors.price,
    textAlign: "right",
  },
  summary: {
    marginTop: 16,
  },
});
