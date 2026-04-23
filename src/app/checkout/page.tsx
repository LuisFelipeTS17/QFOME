"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent } from "react";
import { ArrowLeft, Banknote, CreditCard, QrCode, ShoppingBag, Truck } from "lucide-react";
import { BrandText } from "@/components/brand-text";
import { realizarCheckout } from "@/lib/api";

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
  source?: "manual" | "auto";
};

type UserProfile = {
  id?: number;
  name: string;
  email: string;
  phone?: string;
};

type PaymentMethod = "pix" | "cartao" | "dinheiro";
type OrderStatus = "recebido" | "em_preparo" | "saiu_para_entrega" | "entregue";

type OrderRecord = {
  code: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  estimatedMinutes: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    cep: string;
    street: string;
    number: string;
    district: string;
    complement: string;
  };
  items: OrderItem[];
};

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const paymentVisualByMethod: Record<
  PaymentMethod,
  { src: string; title: string; description: string }
> = {
  cartao: {
    src: "/payments/card.svg",
    title: "Pagamento com cartao",
    description: "Aceitamos cartao de credito e debito direto na entrega.",
  },
  pix: {
    src: "/payments/pix.svg",
    title: "Pagamento com Pix",
    description: "Apos confirmar, exibimos o QR Code para pagamento instantaneo.",
  },
  dinheiro: {
    src: "/payments/cash.svg",
    title: "Pagamento em dinheiro",
    description: "Informe o valor do troco e pague na entrega com praticidade.",
  },
};

const readOrderItems = (): OrderItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem("qfome-order-items");
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as OrderItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const onlyManualItems = parsed.filter((item) => item.source !== "auto");
    if (onlyManualItems.length !== parsed.length) {
      localStorage.setItem("qfome-order-items", JSON.stringify(onlyManualItems));
    }

    return onlyManualItems;
  } catch {
    return [];
  }
};

const readUserProfile = (): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("qfome-user");
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as UserProfile;
    if (!parsed?.name || !parsed?.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const readOrderHistory = (): OrderRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem("qfome-order-history");
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as OrderRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>(() => readOrderItems());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState(() => {
    const user = readUserProfile();
    return {
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      cep: "",
      street: "",
      number: "",
      district: "",
      complement: "",
      changeFor: "",
    };
  });
  const selectedPaymentVisual = paymentVisualByMethod[paymentMethod];

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0),
    [items],
  );
  const delivery = subtotal > 0 && subtotal < 45 ? 6.9 : 0;
  const total = subtotal + delivery;

  const updateField =
    (key: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const clearFeedback = () => {
    if (feedback) {
      setFeedback("");
    }
  };

  const finalizeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) {
      setFeedback("Seu carrinho esta vazio. Adicione pratos antes de finalizar.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.cep.trim() ||
      !form.street.trim() ||
      !form.number.trim() ||
      !form.district.trim()
    ) {
      setFeedback("Preencha os campos obrigatorios para concluir o pedido.");
      return;
    }

    const user = readUserProfile();
    let orderCode = `QF-${Date.now().toString().slice(-6)}`;

    if (user?.id) {
      try {
        const pedido = await realizarCheckout(user.id, paymentMethod, total);
        orderCode = pedido.codigo;
      } catch {
        setFeedback("Erro ao registrar pedido no servidor. Tente novamente.");
        return;
      }
    }

    const estimatedMinutes = Math.max(24, Math.min(48, 20 + items.length * 4));
    const orderRecord: OrderRecord = {
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
    };

    localStorage.setItem("qfome-last-order", JSON.stringify(orderRecord));
    const history = readOrderHistory();
    localStorage.setItem("qfome-order-history", JSON.stringify([orderRecord, ...history].slice(0, 20)));

    localStorage.setItem(
      "qfome-user",
      JSON.stringify({
        ...user,
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      }),
    );
    window.dispatchEvent(new Event("qfome-user-changed"));
    localStorage.setItem("qfome-order-items", JSON.stringify([]));

    setItems([]);
    router.push(`/checkout/sucesso?codigo=${orderCode}`);
  };

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-6xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">Checkout</p>
            <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
              Finalizar pedido
            </h1>
            <p className="mt-2 text-sm text-[#8a5b50]">
              Preencha seus dados para concluir entrega e pagamento.
            </p>

            <form className="mt-5 space-y-5" onSubmit={finalizeOrder}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    Nome completo *
                  </span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={updateField("fullName")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    E-mail *
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    Telefone *
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={updateField("phone")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    CEP *
                  </span>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={updateField("cep")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    Rua *
                  </span>
                  <input
                    type="text"
                    value={form.street}
                    onChange={updateField("street")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    Numero *
                  </span>
                  <input
                    type="text"
                    value={form.number}
                    onChange={updateField("number")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    Bairro *
                  </span>
                  <input
                    type="text"
                    value={form.district}
                    onChange={updateField("district")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-[#efcabc] bg-white px-3 py-2 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                    Complemento
                  </span>
                  <input
                    type="text"
                    value={form.complement}
                    onChange={updateField("complement")}
                    onInput={clearFeedback}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                  />
                </label>
              </div>

              <div className="rounded-3xl border border-[#efcabc] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#8f594b]">
                  Forma de pagamento
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      paymentMethod === "pix"
                        ? "border-[#d72638] bg-[#fff1ec] text-[#7b3024]"
                        : "border-[#efcabc] text-[#7f4a3c] hover:bg-[#fff6f2]"
                    }`}
                  >
                    <QrCode size={15} />
                    Pix
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cartao")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      paymentMethod === "cartao"
                        ? "border-[#d72638] bg-[#fff1ec] text-[#7b3024]"
                        : "border-[#efcabc] text-[#7f4a3c] hover:bg-[#fff6f2]"
                    }`}
                  >
                    <CreditCard size={15} />
                    Cartao
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("dinheiro")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      paymentMethod === "dinheiro"
                        ? "border-[#d72638] bg-[#fff1ec] text-[#7b3024]"
                        : "border-[#efcabc] text-[#7f4a3c] hover:bg-[#fff6f2]"
                    }`}
                  >
                    <Banknote size={15} />
                    Dinheiro
                  </button>
                </div>

                <div className="mt-3 grid items-center gap-3 rounded-2xl border border-[#efcabc] bg-[#fff9f6] p-3 sm:grid-cols-[9rem_1fr]">
                  <div className="relative mx-auto h-20 w-32 sm:h-24 sm:w-36">
                    <Image
                      src={selectedPaymentVisual.src}
                      alt={selectedPaymentVisual.title}
                      fill
                      sizes="(max-width: 640px) 128px, 144px"
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-extrabold text-[#6a3327]">
                      {selectedPaymentVisual.title}
                    </p>
                    <p className="mt-1 text-xs text-[#8a5b50]">
                      {selectedPaymentVisual.description}
                    </p>
                  </div>
                </div>

                {paymentMethod === "dinheiro" ? (
                  <label className="mt-3 block rounded-2xl border border-[#efcabc] bg-[#fff9f6] px-3 py-2">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                      Troco para quanto?
                    </span>
                    <input
                      type="text"
                      value={form.changeFor}
                      onChange={updateField("changeFor")}
                      className="mt-1 w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none"
                    />
                  </label>
                ) : null}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d72638] px-4 py-3 text-sm font-black uppercase tracking-[0.11em] text-white transition hover:bg-[#a81a2a]"
              >
                <Truck size={16} />
                Confirmar pedido
              </button>
            </form>

            {feedback ? (
              <p className="mt-4 rounded-xl border border-[#efcabc] bg-[#fff4ef] px-3 py-2 text-xs font-semibold text-[#7b3f34]">
                {feedback}
              </p>
            ) : null}
          </article>

          <aside className="self-start rounded-[2rem] border border-[#e6b5aa] bg-[#321312] p-4 text-[#ffe5d0] shadow-[0_16px_35px_rgba(60,15,12,0.34)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6c699]">
              Resumo do pedido
            </p>
            <h2 className="font-display mt-2 text-3xl leading-none text-white sm:text-4xl">CHECKOUT</h2>

            {items.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-[#75443a] bg-[#431f1b] p-3">
                <p className="text-sm font-semibold text-[#efcfbb]">Nenhum item no pedido.</p>
                <Link
                  href="/cardapio"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#ffb348] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#4f220d] transition hover:bg-[#ffc770]"
                >
                  <ShoppingBag size={14} />
                  Ir para cardapio
                </Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {items.map((item, index) => (
                  <li
                    key={`${item.slug}-${item.addedAt}-${index}`}
                    className="rounded-2xl border border-[#75443a] bg-[#431f1b] px-3 py-2"
                  >
                    <p className="text-sm font-bold text-white">
                      <BrandText text={item.name} />
                    </p>
                    <p className="text-xs text-[#efcfbb]">Quantidade: {item.quantity}</p>
                    <p className="mt-1 text-sm font-black text-[#ffd08e]">
                      {formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 space-y-2 rounded-2xl border border-[#704339] bg-[#3f1b18] p-3 text-sm">
              <div className="flex items-center justify-between text-[#efcfbb]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[#efcfbb]">
                <span>Entrega</span>
                <span>{delivery > 0 ? formatPrice(delivery) : "Gratis"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#73463a] pt-2 text-white">
                <span className="font-bold">Total</span>
                <span className="text-lg font-black">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/pedido"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#8f5c50] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#ffe5d0] transition hover:bg-[#4d231e]"
            >
              Voltar para carrinho
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
