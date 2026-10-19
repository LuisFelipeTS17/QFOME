"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { rastrearPedido } from "@/lib/api";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  CircleDashed,
  Clock3,
  CookingPot,
  Home,
  Truck,
} from "lucide-react";
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
  source?: "manual" | "auto";
};

type OrderRecord = {
  code: string;
  createdAt: string;
  paymentMethod: "pix" | "cartao" | "dinheiro";
  total: number;
  deliveryFee: number;
  status: "recebido" | "em_preparo" | "saiu_para_entrega" | "entregue";
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

const timeline = [
  { key: "recebido", label: "Pedido recebido", Icon: CircleDashed },
  { key: "em_preparo", label: "Em preparo", Icon: CookingPot },
  { key: "saiu_para_entrega", label: "Saiu para entrega", Icon: Truck },
  { key: "entregue", label: "Entregue", Icon: CheckCircle2 },
] as const;

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

const readLastOrder = (): OrderRecord | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("qfome-last-order");
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as OrderRecord;
    return parsed?.code ? parsed : null;
  } catch {
    return null;
  }
};

const getSearchCode = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("codigo") ?? "";
};

const statusIndex: Record<OrderRecord["status"], number> = {
  recebido: 0,
  em_preparo: 1,
  saiu_para_entrega: 2,
  entregue: 3,
};

const deliveryStatusText = [
  "Pedido confirmado e fila da cozinha iniciada.",
  "Seu prato esta sendo preparado com carinho.",
  "Entregador em rota. Fique de olho no portao.",
  "Pedido entregue. Bom apetite!",
];

const backendStatusMap: Record<string, OrderRecord["status"]> = {
  recebido: "recebido",
  preparo:  "em_preparo",
  entrega:  "saiu_para_entrega",
  entregue: "entregue",
};

export default function AcompanharPedidoPage() {
  const [queryCode] = useState(() => getSearchCode());
  const [order, setOrder] = useState<OrderRecord | null>(() => {
    const codeFromUrl = getSearchCode();
    const history = readOrderHistory();
    const lastOrder = readLastOrder();

    const found =
      (codeFromUrl ? history.find((item) => item.code === codeFromUrl) : null) ??
      (codeFromUrl && lastOrder?.code === codeFromUrl ? lastOrder : null) ??
      lastOrder;

    return found ?? null;
  });

  useEffect(() => {
    const codigo = queryCode || order?.code;
    if (!codigo) return;

    rastrearPedido(codigo)
      .then((dados) => {
        const statusMapeado = backendStatusMap[dados.status] ?? "recebido";
        setOrder((prev) =>
          prev ? { ...prev, status: statusMapeado, total: dados.total } : prev,
        );
      })
      .catch(() => {/* sem backend disponivel, mantém estado local */});
  }, [queryCode, order?.code]);

  const activeStepIndex = useMemo(() => (order ? statusIndex[order.status] ?? 0 : -1), [order]);
  const deliveryProgress = useMemo(() => {
    if (activeStepIndex < 0) {
      return 12;
    }
    return Math.min(100, ((activeStepIndex + 1) / timeline.length) * 100);
  }, [activeStepIndex]);
  const isDelivered = activeStepIndex >= timeline.length - 1;
  const deliveryMessage = deliveryStatusText[Math.max(0, Math.min(activeStepIndex, timeline.length - 1))];

  const etaLabel = useMemo(() => {
    if (!order) {
      return "--";
    }

    return `${order.estimatedMinutes} min`;
  }, [order]);

  if (!order) {
    return (
      <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
        <main className="mx-auto w-full max-w-3xl px-4 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
          >
            <ArrowLeft size={16} />
            Voltar para a home
          </Link>

          <section className="mt-5 rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 text-center shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
            <p className="text-sm font-semibold text-[#7b473d]">
              Nao encontramos um pedido para acompanhar.
            </p>
            <Link
              href="/cliente"
              className="mt-4 inline-flex rounded-2xl bg-[#d72638] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#a81a2a]"
            >
              Ir para area do cliente
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-6xl px-4 pt-6">
        <Link
          href="/cliente"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para cliente
        </Link>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
              Acompanhamento em tempo real
            </p>
            <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
              Pedido {order.code}
            </h1>
            <p className="mt-2 text-sm text-[#8a5b50]">
              {queryCode && queryCode !== order.code
                ? `Exibindo pedido mais recente: ${order.code}`
                : "Veja abaixo o status atualizado da entrega."}
            </p>

            <div className="mt-5 rounded-3xl border border-[#efcabc] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                Entrega em movimento
              </p>
              <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3e9] text-[#d72638]">
                  <CookingPot size={16} />
                </span>
                <div className="delivery-track">
                  <div
                    className="delivery-progress"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                  <span
                    className={`delivery-rider ${isDelivered ? "delivery-rider-stop" : ""}`}
                    style={{ left: `${deliveryProgress}%` }}
                  >
                    {isDelivered ? (
                      <CheckCircle2 size={19} className="text-[#2d995e]" />
                    ) : (
                      <Bike size={19} className="text-[#d72638]" />
                    )}
                  </span>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3e9] text-[#d72638]">
                  <Home size={16} />
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#6f3a2e]">{deliveryMessage}</p>
            </div>

            <div className="mt-5 rounded-3xl border border-[#efcabc] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                Etapas do pedido
              </p>
              <ul className="mt-3 space-y-2">
                {timeline.map((step, index) => (
                  <li
                    key={step.key}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                      index <= activeStepIndex
                        ? "border-[#f0c39f] bg-[#fff3e9]"
                        : "border-[#f1dfd6] bg-[#fffdfa]"
                    }`}
                  >
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                        index <= activeStepIndex ? "bg-[#d72638] text-white" : "bg-[#ead8d0] text-[#8e6458]"
                      }`}
                    >
                      <step.Icon size={16} />
                    </span>
                    <p
                      className={`text-sm font-bold ${
                        index <= activeStepIndex ? "text-[#6f2e23]" : "text-[#8c6257]"
                      }`}
                    >
                      {step.label}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-3xl border border-[#efcabc] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                Itens do pedido
              </p>
              <ul className="mt-2 space-y-2">
                {order.items.map((item, index) => (
                  <li
                    key={`${item.slug}-${item.addedAt}-${index}`}
                    className="rounded-2xl border border-[#f2ddd4] bg-[#fff9f6] px-3 py-2"
                  >
                    <p className="text-sm font-bold text-[#652d23]">
                      <BrandText text={item.name} />
                    </p>
                    <p className="text-xs text-[#8a5d52]">Quantidade: {item.quantity}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside className="self-start rounded-[2rem] border border-[#e6b5aa] bg-[#321312] p-4 text-[#ffe5d0] shadow-[0_16px_35px_rgba(60,15,12,0.34)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6c699]">
              Dados da entrega
            </p>
            <h2 className="font-display mt-2 text-3xl leading-none text-white sm:text-4xl">SEU PEDIDO</h2>

            <div className="mt-4 space-y-2 rounded-2xl border border-[#704339] bg-[#3f1b18] p-3 text-sm">
              <div className="flex items-center justify-between text-[#efcfbb]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex items-center justify-between text-[#efcfbb]">
                <span>Entrega</span>
                <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "Gratis"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#73463a] pt-2 text-white">
                <span className="font-bold">Previsao</span>
                <span className="inline-flex items-center gap-1 text-sm font-black">
                  <Clock3 size={14} />
                  {etaLabel}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#75443a] bg-[#431f1b] p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#efcfbb]">
                Endereco
              </p>
              <p className="mt-1 text-[#ffe5d0]">
                {order.deliveryAddress.street}, {order.deliveryAddress.number}
              </p>
              <p className="text-[#efcfbb]">
                {order.deliveryAddress.district} - CEP {order.deliveryAddress.cep}
              </p>
              {order.deliveryAddress.complement ? (
                <p className="text-[#efcfbb]">Compl.: {order.deliveryAddress.complement}</p>
              ) : null}
            </div>

            <Link
              href="/cardapio"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#ffb348] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#4f220d] transition hover:bg-[#ffc770]"
            >
              Fazer novo pedido
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
