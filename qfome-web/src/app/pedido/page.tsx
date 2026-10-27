"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { BrandText } from "@/components/brand-text";

type OrderExtra = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

type OrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  extras: OrderExtra[];
  note: string;
  totalPrice: number;
  addedAt: string;
};

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function PedidoPage() {
  const [items, setItems] = useState<OrderItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = localStorage.getItem("qfome-order-items");
    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved) as OrderItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0),
    [items],
  );
  const delivery = items.length > 0 ? 6.9 : 0;
  const total = subtotal + delivery;

  const persist = (nextItems: OrderItem[]) => {
    setItems(nextItems);
    localStorage.setItem("qfome-order-items", JSON.stringify(nextItems));
  };

  const removeItem = (index: number) => {
    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
    persist(nextItems);
  };

  const clearOrder = () => {
    persist([]);
  };

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-4xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>

        <section className="mt-5 rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
                Meu pedido
              </p>
              <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">Checkout</h1>
            </div>
            {items.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d72638] px-3 py-2 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#a81a2a]"
                >
                  <ShoppingBag size={14} />
                  Ir para checkout
                </Link>
                <button
                  type="button"
                  onClick={clearOrder}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-sm font-bold text-[#7c4135] transition hover:bg-[#fff2eb]"
                >
                  <Trash2 size={14} />
                  Limpar pedido
                </button>
              </div>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#efcabc] bg-white p-6 text-center">
              <p className="text-base font-semibold text-[#7e4a3d]">Seu pedido ainda esta vazio.</p>
              <Link
                href="/cardapio"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#d72638] px-4 py-2 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#a81a2a]"
              >
                <ShoppingBag size={14} />
                Ir para cardapio
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item, index) => (
                <article
                  key={`${item.slug}-${item.addedAt}-${index}`}
                  className="rounded-2xl border border-[#efcabc] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-extrabold text-[#61261d]">
                        <BrandText text={item.name} />
                      </p>
                      <p className="text-sm text-[#83554a]">Quantidade: {item.quantity}</p>
                      {item.note ? (
                        <p className="mt-1 text-xs font-semibold text-[#9a5f52]">Obs.: {item.note}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg border border-[#efcabc] px-2 py-1 text-xs font-bold text-[#7b3f34] transition hover:bg-[#fff2eb]"
                    >
                      Remover
                    </button>
                  </div>

                  {item.extras?.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-[#754438]">
                      {item.extras.map((extra) => (
                        <li key={`${item.slug}-${extra.id}`}>
                          + {extra.name}
                          {extra.quantity && extra.quantity > 1 ? ` x${extra.quantity}` : ""} (
                          {formatPrice(extra.price)})
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <p className="mt-3 text-right text-lg font-black text-[#bf1f34]">
                    {formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}
                  </p>
                </article>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-[#efcabc] bg-white p-4 text-sm">
            <div className="flex items-center justify-between text-[#78493e]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[#78493e]">
              <span>Entrega</span>
              <span>{formatPrice(delivery)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#f2d3c8] pt-2 text-[#5c281f]">
              <span className="font-bold">Total</span>
              <span className="text-xl font-black">{formatPrice(total)}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
