"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import type { MenuProduct } from "@/data/menu-products";

type ProductOrderPanelProps = {
  product: MenuProduct;
  autoAddEnabled?: boolean;
};

type SavedOrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  extras: Array<{ id: string; name: string; price: number }>;
  note: string;
  totalPrice: number;
  addedAt: string;
  source?: "manual" | "auto";
};

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function ProductOrderPanel({ product, autoAddEnabled = false }: ProductOrderPanelProps) {
  const router = useRouter();
  const autoAddLockRef = useRef(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const selectedExtras = useMemo(
    () => product.extras.filter((extra) => selectedExtraIds.includes(extra.id)),
    [product.extras, selectedExtraIds],
  );

  const extrasTotal = useMemo(
    () => selectedExtras.reduce((sum, extra) => sum + extra.price, 0),
    [selectedExtras],
  );

  const totalPrice = useMemo(
    () => (product.price + extrasTotal) * quantity,
    [extrasTotal, product.price, quantity],
  );

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((current) =>
      current.includes(id) ? current.filter((extraId) => extraId !== id) : [...current, id],
    );
  };

  const saveToOrder = useCallback((action: "add" | "buy") => {
    const orderItem: SavedOrderItem = {
      slug: product.slug,
      name: product.name,
      quantity,
      unitPrice: product.price,
      extras: selectedExtras.map(({ id, name, price }) => ({ id, name, price })),
      note: note.trim(),
      totalPrice,
      addedAt: new Date().toISOString(),
      source: "manual",
    };

    try {
      const saved = localStorage.getItem("qfome-order-items");
      const parsed = saved ? (JSON.parse(saved) as SavedOrderItem[]) : [];
      const previousItems = Array.isArray(parsed) ? parsed : [];
      const nonAutoItems = previousItems.filter((item) => item.source !== "auto");
      localStorage.setItem("qfome-order-items", JSON.stringify([...nonAutoItems, orderItem]));

      if (action === "buy") {
        router.push("/checkout");
        return;
      }

      setFeedback("Item adicionado ao pedido com sucesso.");
    } catch {
      setFeedback("Nao foi possivel salvar o pedido no navegador.");
    }
  }, [note, product.name, product.price, product.slug, quantity, router, selectedExtras, totalPrice]);

  useEffect(() => {
    if (!autoAddEnabled || autoAddLockRef.current) {
      return;
    }

    autoAddLockRef.current = true;

    const autoOrderItem: SavedOrderItem = {
      slug: product.slug,
      name: product.name,
      quantity,
      unitPrice: product.price,
      extras: selectedExtras.map(({ id, name, price }) => ({ id, name, price })),
      note: note.trim(),
      totalPrice,
      addedAt: new Date().toISOString(),
      source: "auto",
    };

    try {
      const saved = localStorage.getItem("qfome-order-items");
      const parsed = saved ? (JSON.parse(saved) as SavedOrderItem[]) : [];
      const previousItems = Array.isArray(parsed) ? parsed : [];
      const now = Date.now();

      const hasRecentItem = previousItems.some((item) => {
        if (item.slug !== autoOrderItem.slug) {
          return false;
        }

        const addedAtTime = Date.parse(item.addedAt);
        if (!Number.isFinite(addedAtTime)) {
          return false;
        }

        return now - addedAtTime < 2500;
      });

      if (hasRecentItem) {
        return;
      }

      localStorage.setItem("qfome-order-items", JSON.stringify([...previousItems, autoOrderItem]));
    } catch {
      return;
    }
  }, [autoAddEnabled, note, product.name, product.price, product.slug, quantity, selectedExtras, totalPrice]);

  return (
    <aside className="self-start rounded-[2rem] border border-[#e6b5aa] bg-[#321312] p-4 text-[#ffe5d0] shadow-[0_16px_35px_rgba(60,15,12,0.34)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6c699]">
        Monte seu pedido
      </p>
      <h2 className="font-display mt-2 text-3xl leading-none text-white sm:text-4xl">SEU COMBO</h2>

      <div className="mt-5 rounded-2xl border border-[#75453a] bg-[#431f1b] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#f0bfa4]">
          Quantidade
        </p>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-[#8d5c4f] p-2 transition hover:bg-[#5a2b24]"
            aria-label="Diminuir quantidade"
          >
            <Minus size={16} />
          </button>
          <p className="text-2xl font-black text-white">{quantity}</p>
          <button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            className="rounded-lg border border-[#8d5c4f] p-2 transition hover:bg-[#5a2b24]"
            aria-label="Aumentar quantidade"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#75453a] bg-[#431f1b] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#f0bfa4]">
          Adicionais
        </p>
        <div className="mt-2 space-y-2">
          {product.extras.map((extra) => {
            const isSelected = selectedExtraIds.includes(extra.id);
            return (
              <button
                key={extra.id}
                type="button"
                onClick={() => toggleExtra(extra.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "border-[#ffb548] bg-[#5a2b24] text-white"
                    : "border-[#6e4035] bg-[#4a231f] text-[#f6d2bd] hover:bg-[#5a2b24]"
                }`}
              >
                <span>{extra.name}</span>
                <span className="font-bold text-[#ffcb86]">+ {formatPrice(extra.price)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#75453a] bg-[#431f1b] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#f0bfa4]">
          Observacao
        </p>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={160}
          placeholder="Ex.: sem pimenta, ponto da carne, trocar bebida..."
          className="mt-2 w-full resize-none rounded-xl border border-[#704034] bg-[#532924] p-2 text-sm text-white outline-none placeholder:text-[#d7a98f] focus:border-[#ffb548]"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-[#75453a] bg-[#431f1b] p-3 text-sm">
        <div className="flex items-center justify-between text-[#efcfbb]">
          <span>Preco base</span>
          <span>{formatPrice(product.price)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[#efcfbb]">
          <span>Adicionais</span>
          <span>{formatPrice(extrasTotal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[#efcfbb]">
          <span>Quantidade</span>
          <span>{quantity}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[#73463a] pt-2 text-white">
          <span className="font-bold">Total</span>
          <span className="text-xl font-black">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() => saveToOrder("add")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffb348] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#4f220d] transition hover:bg-[#ffc770]"
        >
          <ShoppingBag size={16} />
          Adicionar ao pedido
        </button>
        <button
          type="button"
          onClick={() => saveToOrder("buy")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#8f5c50] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#ffe5d0] transition hover:bg-[#4d231e]"
        >
          <Zap size={16} />
          Comprar agora
        </button>
      </div>

      {feedback ? (
        <p className="mt-3 rounded-xl border border-[#845348] bg-[#4a231e] px-3 py-2 text-xs font-semibold text-[#ffce95]">
          {feedback}
        </p>
      ) : null}
    </aside>
  );
}
