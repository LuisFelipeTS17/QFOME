"use client";

import { ArrowLeft, Clock3, MapPin, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { getHistoricoPedidos } from "@/lib/api";

type UserProfile = {
  id?: number;
  name: string;
  email: string;
  phone?: string;
};

type LastOrder = {
  code: string;
  createdAt: string;
  paymentMethod: string;
  total: number;
  status?: "recebido" | "em_preparo" | "saiu_para_entrega" | "entregue";
  estimatedMinutes?: number;
};

type OrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
};

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const readUser = (): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("qfome-user");
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as UserProfile;
    if (!parsed.name || !parsed.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const readLastOrder = (): LastOrder | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("qfome-last-order");
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as LastOrder;
    return parsed?.code ? parsed : null;
  } catch {
    return null;
  }
};

const readCartItems = (): OrderItem[] => {
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
};

const readOrderHistory = (): LastOrder[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem("qfome-order-history");
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as LastOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const statusLabel: Record<string, string> = {
  recebido: "Recebido",
  em_preparo: "Em preparo",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
};

export default function ClientePage() {
  const [user] = useState<UserProfile | null>(() => readUser());
  const [lastOrder] = useState<LastOrder | null>(() => readLastOrder());
  const [orderHistory, setOrderHistory] = useState<LastOrder[]>(() => readOrderHistory());
  const [cartItems] = useState<OrderItem[]>(() => readCartItems());

  useEffect(() => {
    if (!user?.id) return;
    getHistoricoPedidos(user.id)
      .then((pedidos) => {
        const mapeados: LastOrder[] = pedidos.map((p) => ({
          code:          p.codigo,
          createdAt:     p.dataCriacao,
          paymentMethod: "pix",
          total:         p.total,
          status:        "recebido" as LastOrder["status"],
        }));
        setOrderHistory(mapeados);
      })
      .catch(() => {/* mantém histórico local se backend indisponível */});
  }, [user?.id]);
  const handleLogout = () => {
    localStorage.removeItem("qfome-user");
    window.location.href = "/entrar";
  };

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0),
    [cartItems],
  );
  const recentOrders = useMemo(() => orderHistory.slice(0, 6), [orderHistory]);
  const latestOrder = recentOrders[0] ?? lastOrder;

  if (!user) {
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
              Voce ainda nao tem uma conta ativa.
            </p>
            <Link
              href="/entrar"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#d72638] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#a81a2a]"
            >
              <UserRound size={16} />
              Criar conta
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-6xl px-4 pt-6">
        <div className="flex gap-2 items-center mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
          >
            <ArrowLeft size={16} />
            Voltar para a home
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#d72638] transition hover:bg-[#fff0e8] ml-2"
          >
            Sair
          </button>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">Area do cliente</p>
            <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
              Ola, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-2 text-sm text-[#8a5b50]">Gerencie seus pedidos e acompanhe seu checkout.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#efcabc] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">Nome</p>
                <p className="mt-1 text-sm font-extrabold text-[#5b2c24]">{user.name}</p>
              </div>
              <div className="rounded-2xl border border-[#efcabc] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">E-mail</p>
                <p className="mt-1 text-sm font-extrabold text-[#5b2c24]">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-[#efcabc] bg-white p-4 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">Telefone</p>
                <p className="mt-1 text-sm font-extrabold text-[#5b2c24]">
                  {user.phone?.trim() ? user.phone : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link
                href="/cardapio"
                className="rounded-2xl border border-[#efcabc] bg-white px-3 py-3 text-center text-sm font-black uppercase tracking-[0.1em] text-[#7a3f33] transition hover:bg-[#fff3ed]"
              >
                Ver cardapio
              </Link>
              <Link
                href="/pedido"
                className="rounded-2xl border border-[#efcabc] bg-white px-3 py-3 text-center text-sm font-black uppercase tracking-[0.1em] text-[#7a3f33] transition hover:bg-[#fff3ed]"
              >
                Meu carrinho
              </Link>
              <Link
                href="/checkout"
                className="rounded-2xl bg-[#d72638] px-3 py-3 text-center text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#a81a2a]"
              >
                Ir para checkout
              </Link>
            </div>

            <div className="mt-6 rounded-3xl border border-[#efcabc] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
                Historico de pedidos
              </p>

              {recentOrders.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-[#f2ddd4] bg-[#fff9f6] px-3 py-3 text-sm text-[#825247]">
                  Nenhum pedido finalizado ainda.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {recentOrders.map((order) => (
                    <li
                      key={`${order.code}-${order.createdAt}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#f2ddd4] bg-[#fff9f6] px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-extrabold text-[#5b2c24]">{order.code}</p>
                        <p className="text-xs text-[#8a5d52]">
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs font-semibold text-[#a04d3f]">
                          {statusLabel[order.status ?? "recebido"] ?? "Recebido"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#bf1f34]">{formatPrice(order.total)}</p>
                        <Link
                          href={`/acompanhar-pedido?codigo=${order.code}`}
                          className="text-xs font-black uppercase tracking-[0.08em] text-[#d72638] transition hover:text-[#a81a2a]"
                        >
                          Acompanhar
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <aside className="self-start rounded-[2rem] border border-[#e6b5aa] bg-[#321312] p-4 text-[#ffe5d0] shadow-[0_16px_35px_rgba(60,15,12,0.34)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6c699]">
              Resumo rapido
            </p>
            <h2 className="font-display mt-2 text-3xl leading-none text-white sm:text-4xl">SEUS PEDIDOS</h2>

            <div className="mt-4 rounded-2xl border border-[#75443a] bg-[#431f1b] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#efcfbb]">
                Carrinho atual
              </p>
              <p className="mt-1 text-sm text-[#efcfbb]">{cartItems.length} itens no momento</p>
              <p className="mt-2 text-lg font-black text-[#ffd08e]">{formatPrice(cartTotal)}</p>
            </div>

            {latestOrder ? (
              <div className="mt-3 rounded-2xl border border-[#75443a] bg-[#431f1b] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#efcfbb]">
                  Ultimo pedido
                </p>
                <p className="mt-1 text-sm font-bold text-white">Codigo {latestOrder.code}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#efcfbb]">
                  <Clock3 size={13} />
                  {new Date(latestOrder.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#efcfbb]">
                  <MapPin size={13} />
                  {statusLabel[latestOrder.status ?? "recebido"] ?? "Recebido"}
                </p>
                <p className="mt-2 text-lg font-black text-[#ffd08e]">
                  {formatPrice(latestOrder.total)}
                </p>
                <Link
                  href={`/acompanhar-pedido?codigo=${latestOrder.code}`}
                  className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.08em] text-[#ffcd88] transition hover:text-white"
                >
                  Acompanhar pedido
                </Link>
              </div>
            ) : (
              <p className="mt-3 rounded-2xl border border-[#75443a] bg-[#431f1b] px-3 py-3 text-sm text-[#efcfbb]">
                Voce ainda nao finalizou um pedido.
              </p>
            )}

            <Link
              href="/checkout"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffb348] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#4f220d] transition hover:bg-[#ffc770]"
            >
              <ShoppingBag size={15} />
              Finalizar agora
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
