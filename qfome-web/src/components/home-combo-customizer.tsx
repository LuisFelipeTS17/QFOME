"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

type ComboSize = {
  id: string;
  label: string;
  extraPrice: number;
};

type ComboExtra = {
  id: string;
  name: string;
  price: number;
};

type SavedOrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  extras: Array<{ id: string; name: string; price: number; quantity: number }>;
  note: string;
  totalPrice: number;
  addedAt: string;
};

const basePrice = 29.9;

const sizeOptions: ComboSize[] = [
  { id: "individual", label: "Individual", extraPrice: 0 },
  { id: "duplo", label: "Duplo", extraPrice: 8 },
  { id: "familia", label: "Familia", extraPrice: 16 },
];

const extraOptions: ComboExtra[] = [
  { id: "farofa-bacon", name: "Farofa de bacon", price: 4 },
  { id: "molho-picante", name: "Molho picante da casa", price: 3 },
  { id: "queijo-gratinado", name: "Queijo gratinado", price: 5 },
];

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function HomeComboCustomizer() {
  const [selectedSize, setSelectedSize] = useState<ComboSize["id"]>("individual");
  const [comboQuantity, setComboQuantity] = useState(1);
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  const selectedSizeData = useMemo(
    () => sizeOptions.find((size) => size.id === selectedSize) ?? sizeOptions[0],
    [selectedSize],
  );

  const selectedExtras = useMemo(
    () =>
      extraOptions
        .map((extra) => ({ ...extra, quantity: extraQuantities[extra.id] ?? 0 }))
        .filter((extra) => extra.quantity > 0),
    [extraQuantities],
  );

  const extrasTotal = useMemo(
    () => selectedExtras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0),
    [selectedExtras],
  );

  const unitPrice = basePrice + selectedSizeData.extraPrice + extrasTotal;
  const totalPrice = unitPrice * comboQuantity;

  const updateExtraQuantity = (id: string, delta: number) => {
    setExtraQuantities((current) => {
      const nextValue = Math.max(0, (current[id] ?? 0) + delta);
      return { ...current, [id]: nextValue };
    });
  };

  const removeExtra = (id: string) => {
    setExtraQuantities((current) => ({ ...current, [id]: 0 }));
  };

  const saveComboToOrder = () => {
    const orderItem: SavedOrderItem = {
      slug: "combo-personalizado-home",
      name: "Combo Personalizado QFome",
      quantity: comboQuantity,
      unitPrice,
      extras: selectedExtras.map((extra) => ({
        id: extra.id,
        name: extra.name,
        price: extra.price,
        quantity: extra.quantity,
      })),
      note: `Tamanho: ${selectedSizeData.label}`,
      totalPrice,
      addedAt: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem("qfome-order-items");
      const parsed = saved ? (JSON.parse(saved) as SavedOrderItem[]) : [];
      const previousItems = Array.isArray(parsed) ? parsed : [];
      localStorage.setItem("qfome-order-items", JSON.stringify([...previousItems, orderItem]));
      setFeedback("Combo personalizado adicionado ao pedido.");
    } catch {
      setFeedback("Nao foi possivel salvar o combo no pedido.");
    }
  };

  return (
    <article className="rise-in rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-6 shadow-[0_15px_30px_rgba(108,53,34,0.11)]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6052]">
        Personalize seu pedido
      </p>
      <h2 className="font-display mt-2 text-5xl leading-none text-[#7d141e]">Monte seu combo</h2>
      <p className="mt-2 text-sm text-[#8c5b4e]">
        Escolha base, proteina e acompanhamentos. O preco atualiza em tempo real no checkout.
      </p>

      <div className="mt-5 space-y-4">
        <div className="rounded-3xl border border-[#f0ccbe] bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#9a6254]">Tamanho</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setComboQuantity((current) => Math.max(1, current - 1))}
                className="rounded-md border border-[#efc9bd] p-1 text-[#7a4539]"
                aria-label="Diminuir quantidade"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-black text-[#7a4539]">{comboQuantity}</span>
              <button
                type="button"
                onClick={() => setComboQuantity((current) => current + 1)}
                className="rounded-md bg-[#d72638] p-1 text-white"
                aria-label="Aumentar quantidade"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const selected = selectedSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSize(size.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
                    selected
                      ? "bg-[#d72638] text-white"
                      : "border border-[#f0c7b7] text-[#7c4a40] hover:bg-[#fff2eb]"
                  }`}
                >
                  {size.label}
                  {size.extraPrice > 0 ? ` +${formatPrice(size.extraPrice)}` : ""}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[#f0ccbe] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#9a6254]">Adicionais</p>
          <div className="mt-3 space-y-2 text-sm text-[#66352d]">
            {extraOptions.map((extra) => {
              const quantity = extraQuantities[extra.id] ?? 0;
              return (
                <div
                  key={extra.id}
                  className="flex items-center justify-between rounded-2xl border border-[#f2d3c8] bg-[#fff9f6] px-3 py-2"
                >
                  <span>{extra.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#cf2841]">
                      +{formatPrice(extra.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateExtraQuantity(extra.id, -1)}
                      className="rounded-md border border-[#efc9bd] p-1"
                      aria-label={`Remover ${extra.name}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-4 text-center font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateExtraQuantity(extra.id, 1)}
                      className="rounded-md bg-[#d72638] p-1 text-white"
                      aria-label={`Adicionar ${extra.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[#f0ccbe] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#9a6254]">
            Itens selecionados
          </p>
          {selectedExtras.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {selectedExtras.map((extra) => (
                <li
                  key={extra.id}
                  className="flex items-center justify-between rounded-xl border border-[#f2d3c8] bg-[#fff9f6] px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-[#66352d]">
                    {extra.name} x{extra.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExtra(extra.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#efc9bd] px-2 py-1 text-xs font-bold text-[#8a4f42] hover:bg-[#ffece4]"
                  >
                    <X size={12} />
                    tirar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#8b5d52]">
              Nenhum adicional selecionado. Use os botoes de + e - para ajustar.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#f0ccbe] bg-white p-4 text-sm">
          <div className="flex items-center justify-between text-[#7b4a3e]">
            <span>Preco base do combo</span>
            <span>{formatPrice(basePrice)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[#7b4a3e]">
            <span>Tamanho ({selectedSizeData.label})</span>
            <span>{formatPrice(selectedSizeData.extraPrice)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[#7b4a3e]">
            <span>Adicionais</span>
            <span>{formatPrice(extrasTotal)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[#7b4a3e]">
            <span>Quantidade</span>
            <span>{comboQuantity}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#f2d3c8] pt-2">
            <span className="font-bold text-[#6b3427]">Total do combo</span>
            <span className="text-xl font-black text-[#bf1f34]">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={saveComboToOrder}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d72638] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#a81a2a]"
        >
          <ShoppingBag size={16} />
          Adicionar combo ao pedido
        </button>

        {feedback ? (
          <p className="rounded-xl border border-[#efc9bd] bg-[#fff4ef] px-3 py-2 text-xs font-semibold text-[#7b3f34]">
            {feedback}
          </p>
        ) : null}
      </div>
    </article>
  );
}

