"""Dashboard QFOME — Analise de Dados e Estatistica (item 2.5 do roteiro).

Le o arquivo pedidos.json gerado pelo botao "Exportar dados" do aplicativo
(qfome-mobile -> backend Node -> data/exports/pedidos.json) ou planilha CSV/JSON
enviada pelo usuario e apresenta os indicadores executivos e estatisticos de
venda do restaurante.

Como rodar:
    pip install -r requirements.txt
    streamlit run app.py
"""

from __future__ import annotations

import io
import json
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import requests
import streamlit as st

# ---------------------------------------------------------------------------
# Paleta oficial QFOME (alinhada ao qfome-web e qfome-mobile)
# ---------------------------------------------------------------------------
COR_FUNDO = "#f7ecdf"
COR_SUPERFICIE = "#fffaf3"
COR_CARTAO = "#ffffff"
COR_PAINEL_ESCURO = "#321312"
COR_PAINEL_CARTAO = "#431f1b"
COR_MARCA = "#d72638"
COR_MARCA_PROFUNDA = "#981b1e"
COR_ACENTO = "#ffac39"
COR_LARANJA = "#ff7832"
COR_VERDE = "#2c8f54"
COR_AZUL_ACO = "#246ca4"
COR_TINTA = "#2a120b"
COR_TINTA_SUAVE = "#654037"
COR_ROTULO = "#8f594b"
COR_BORDA = "#efcabc"
COR_GRADE = "#edd6c6"

ARQUIVO_PADRAO = (
    Path(__file__).resolve().parent.parent
    / "qfome-backend-node"
    / "data"
    / "exports"
    / "pedidos.json"
)
PASTA_COMPRAS = (
    Path(__file__).resolve().parent.parent
    / "qfome-backend-node"
    / "data"
    / "purchases"
)
API_PADRAO = "http://localhost:8080/relatorios/pedidos"

ROTULOS_PAGAMENTO = {
    "PIX": "PIX",
    "CARTAO": "Cartao de Credito/Debito",
    "MERCADO_PAGO": "Mercado Pago",
    "DINHEIRO": "Dinheiro",
}

ROTULOS_STATUS = {
    "RECEBIDO": "Recebido",
    "EM_PREPARO": "Em preparo",
    "SAIU_PARA_ENTREGA": "Saiu para entrega",
    "ENTREGUE": "Entregue",
    "CANCELADO": "Cancelado",
    "PENDENTE": "Pendente",
}

CORES_CATEGORIA = {
    "Caseira": "#d72638",
    "Grelhados": "#b0252a",
    "Fit & Fresh": "#2c8f54",
    "Peixes": "#246ca4",
    "Sopas": "#e07a24",
    "Sobremesas": "#c44569",
}

st.set_page_config(
    page_title="Dashboard QFOME — Analise de Dados",
    page_icon=":material/monitoring:",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ---------------------------------------------------------------------------
# Biblioteca de icones vetoriais (Lucide SVG — sem uso de emojis)
# ---------------------------------------------------------------------------
PATHS_ICONES: dict[str, str] = {
    "utensils": (
        '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/>'
        '<path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/>'
        '<path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>'
    ),
    "bar-chart": (
        '<path d="M3 3v18h18"/>'
        '<path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>'
    ),
    "wallet": (
        '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>'
        '<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'
    ),
    "shopping-bag": (
        '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>'
        '<path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'
    ),
    "trending-up": (
        '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>'
        '<polyline points="16 7 22 7 22 13"/>'
    ),
    "package-check": (
        '<path d="m16 16 2 2 4-4"/>'
        '<path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>'
        '<path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/>'
    ),
    "layers": (
        '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>'
        '<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>'
        '<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>'
    ),
    "award": (
        '<circle cx="12" cy="8" r="6"/>'
        '<path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>'
    ),
    "credit-card": (
        '<rect width="20" height="14" x="2" y="5" rx="2"/>'
        '<line x1="2" x2="22" y1="10" y2="10"/>'
    ),
    "check-circle": (
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>'
        '<polyline points="22 4 12 14.01 9 11.01"/>'
    ),
    "activity": (
        '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>'
    ),
    "table": (
        '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/>'
        '<path d="M3 9h18"/><path d="M3 15h18"/>'
    ),
    "calendar": (
        '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>'
        '<line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>'
        '<line x1="3" x2="21" y1="10" y2="10"/>'
    ),
    "database": (
        '<ellipse cx="12" cy="5" rx="9" ry="3"/>'
        '<path d="M3 5V19A9 3 0 0 0 21 19V5"/>'
        '<path d="M3 12A9 3 0 0 0 21 12"/>'
    ),
    "truck": (
        '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>'
        '<path d="M15 18H9"/>'
        '<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>'
        '<circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'
    ),
    "users": (
        '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>'
        '<circle cx="9" cy="7" r="4"/>'
        '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
    ),
    "sliders": (
        '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/>'
        '<line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/>'
        '<line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/>'
        '<line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/>'
        '<line x1="18" x2="22" y1="16" y2="16"/>'
    ),
}


def icone_svg(nome: str, tamanho: int = 18, cor: str = "currentColor") -> str:
    """Retorna um SVG inline vetorial (Lucide) sem depender de emojis."""
    conteudo = PATHS_ICONES.get(nome, PATHS_ICONES["bar-chart"])
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{tamanho}" height="{tamanho}" '
        f'viewBox="0 0 24 24" fill="none" stroke="{cor}" stroke-width="2" '
        f'stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">'
        f"{conteudo}</svg>"
    )


def injetar_estilos() -> None:
    """Aplica o design system QFOME ao Streamlit."""
    st.markdown(
        f"""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&display=swap');

        html, body, [class*="css"] {{
            font-family: 'Manrope', 'Segoe UI', system-ui, sans-serif;
            color: {COR_TINTA};
        }}

        .stApp {{
            background: radial-gradient(circle at top right, #ffd69e 0%, {COR_FUNDO} 34%), {COR_FUNDO};
        }}

        .block-container {{
            padding-top: 1.8rem;
            padding-bottom: 3rem;
            max-width: 1400px;
        }}

        /* Barra lateral */
        section[data-testid="stSidebar"] {{
            background-color: {COR_SUPERFICIE};
            border-right: 1px solid {COR_BORDA};
        }}

        section[data-testid="stSidebar"] .block-container {{
            padding-top: 1.4rem;
        }}

        /* Banner executivo superior (DarkPanel QFOME) */
        .qfome-hero {{
            background: linear-gradient(135deg, {COR_PAINEL_ESCURO} 0%, #471b18 65%, #5a201b 100%);
            border: 1px solid #75443a;
            border-radius: 24px;
            padding: 26px 30px;
            color: #ffe5d0;
            box-shadow: 0 16px 36px rgba(50, 19, 18, 0.18);
            margin-bottom: 22px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }}

        .qfome-hero-left {{
            display: flex;
            align-items: flex-start;
            gap: 18px;
            max-width: 740px;
        }}

        .qfome-brand-badge {{
            width: 52px;
            height: 52px;
            border-radius: 16px;
            background: linear-gradient(145deg, {COR_MARCA} 0%, {COR_LARANJA} 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 18px rgba(215, 38, 56, 0.35);
            flex-shrink: 0;
        }}

        .qfome-eyebrow {{
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #ffd08e;
            margin-bottom: 4px;
        }}

        .qfome-hero-title {{
            font-family: 'Bebas Neue', 'Arial Narrow', sans-serif;
            font-size: 2.55rem;
            line-height: 1;
            letter-spacing: 0.04em;
            color: #ffffff;
            margin: 0 0 6px 0;
        }}

        .qfome-hero-title span {{
            color: {COR_ACENTO};
        }}

        .qfome-hero-sub {{
            font-size: 0.9rem;
            color: #efcfbb;
            margin: 0;
            line-height: 1.45;
        }}

        .qfome-meta-pills {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
        }}

        .qfome-pill {{
            background: {COR_PAINEL_CARTAO};
            border: 1px solid #75443a;
            border-radius: 14px;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 9px;
            color: #ffe5d0;
            font-size: 0.8rem;
            font-weight: 600;
        }}

        .qfome-pill-label {{
            display: block;
            font-size: 0.65rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #f6c699;
        }}

        .qfome-pill-value {{
            display: block;
            font-size: 0.86rem;
            font-weight: 700;
            color: #ffffff;
        }}

        /* Cards de indicadores (KPIs) */
        .qfome-kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 22px;
        }}

        .qfome-kpi-card {{
            background: {COR_CARTAO};
            border: 1px solid {COR_BORDA};
            border-radius: 20px;
            padding: 20px 22px;
            box-shadow: 0 8px 22px rgba(121, 66, 34, 0.06);
            position: relative;
            overflow: hidden;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
        }}

        .qfome-kpi-card:hover {{
            transform: translateY(-2px);
            box-shadow: 0 12px 26px rgba(121, 66, 34, 0.10);
        }}

        .qfome-kpi-top {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }}

        .qfome-kpi-label {{
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.13em;
            text-transform: uppercase;
            color: {COR_ROTULO};
        }}

        .qfome-kpi-icon {{
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }}

        .qfome-kpi-value {{
            font-size: 1.75rem;
            font-weight: 800;
            color: {COR_TINTA};
            line-height: 1.15;
            margin-bottom: 6px;
            letter-spacing: -0.02em;
        }}

        .qfome-kpi-foot {{
            font-size: 0.78rem;
            font-weight: 600;
            color: {COR_TINTA_SUAVE};
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        /* Cabecalhos de secao */
        .qfome-section-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 10px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid {COR_BORDA};
        }}

        .qfome-section-title-wrap {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}

        .qfome-section-icon {{
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: #ffe9cc;
            border: 1px solid #f2b789;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7a2a1f;
        }}

        .qfome-section-title {{
            font-size: 1.05rem;
            font-weight: 800;
            color: #62261d;
            margin: 0;
        }}

        .qfome-section-subtitle {{
            font-size: 0.8rem;
            color: {COR_ROTULO};
            font-weight: 600;
        }}

        /* Cartao de estatisticas descritivas */
        .qfome-stats-strip {{
            background: {COR_SUPERFICIE};
            border: 1px solid {COR_BORDA};
            border-radius: 18px;
            padding: 16px 20px;
            margin: 8px 0 22px 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
            gap: 14px;
        }}

        .qfome-stat-item {{
            background: {COR_CARTAO};
            border: 1px solid #f4d2c6;
            border-radius: 14px;
            padding: 12px 14px;
        }}

        .qfome-stat-item-label {{
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.11em;
            text-transform: uppercase;
            color: {COR_ROTULO};
            margin-bottom: 4px;
        }}

        .qfome-stat-item-value {{
            font-size: 1.08rem;
            font-weight: 800;
            color: #5c281f;
        }}

        .qfome-stat-item-hint {{
            font-size: 0.72rem;
            color: {COR_TINTA_SUAVE};
            margin-top: 2px;
        }}

        /* Sidebar header customizado */
        .qfome-sidebar-brand {{
            background: {COR_PAINEL_ESCURO};
            border: 1px solid #75443a;
            border-radius: 16px;
            padding: 14px 16px;
            color: #ffe5d0;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }}

        .qfome-sidebar-brand-title {{
            font-family: 'Bebas Neue', sans-serif;
            font-size: 1.45rem;
            letter-spacing: 0.05em;
            color: #ffffff;
            line-height: 1;
        }}

        .qfome-sidebar-brand-sub {{
            font-size: 0.72rem;
            color: #f6c699;
            font-weight: 600;
            margin-top: 2px;
        }}

        /* Container de graficos */
        div[data-testid="stPlotlyChart"] {{
            background: {COR_CARTAO};
            border: 1px solid {COR_BORDA};
            border-radius: 20px;
            padding: 10px 12px 6px 12px;
            box-shadow: 0 6px 18px rgba(121, 66, 34, 0.05);
        }}
        </style>
        """,
        unsafe_allow_html=True,
    )


def cabecalho_secao(icone: str, titulo: str, subtitulo: str = "") -> None:
    """Renderiza um cabecalho de secao com icone vetorial."""
    sub_html = f'<span class="qfome-section-subtitle">{subtitulo}</span>' if subtitulo else ""
    st.markdown(
        f"""
        <div class="qfome-section-header">
            <div class="qfome-section-title-wrap">
                <div class="qfome-section-icon">{icone_svg(icone, 16, "#7a2a1f")}</div>
                <h3 class="qfome-section-title">{titulo}</h3>
            </div>
            {sub_html}
        </div>
        """,
        unsafe_allow_html=True,
    )


def formatar_moeda(valor: float) -> str:
    """Formata numero float no padrao monetario brasileiro (R$ 1.234,56)."""
    texto = f"{float(valor):,.2f}"
    return "R$ " + texto.replace(",", "_").replace(".", ",").replace("_", ".")


def converter_data_hora(serie: pd.Series) -> pd.Series:
    """Converte strings de data/hora em multiplos formatos (ISO-8601 com ou sem
    milissegundos, com ou sem sufixo Z/fuso, ou padrao brasileiro) para datetime.
    """
    if serie.empty:
        return pd.to_datetime(serie)

    if pd.api.types.is_datetime64_any_dtype(serie):
        return serie

    limpa = (
        serie.astype(str)
        .str.strip()
        .str.replace(r"Z$", "", regex=True)
        .str.replace(r"[+-]\d{2}:\d{2}$", "", regex=True)
    )
    try:
        return pd.to_datetime(limpa, format="ISO8601")
    except (ValueError, TypeError):
        return pd.to_datetime(limpa, format="mixed", dayfirst=True, errors="coerce")


def formatar_instante_exportacao(valor: str | None) -> str:
    """Formata a string ISO do campo geradoEm para exibicao amigavel."""
    if not valor or valor == "—":
        return "Nao informado"
    serie = converter_data_hora(pd.Series([valor]))
    if serie.isna().iloc[0]:
        return str(valor)
    return serie.iloc[0].strftime("%d/%m/%Y as %H:%M")


def normalizar_registro_compra(registro: dict[str, Any], indice: int = 1) -> dict[str, Any]:
    """Converte um arquivo individual de compra (data/purchases/compra_*.json)
    para a estrutura padrao de pedido do relatorio.
    """
    resumo = registro.get("resumo") or {}
    pagamento = registro.get("pagamento") or {}
    produtos = registro.get("produtos") or registro.get("itens") or []

    itens_normalizados = []
    for idx_item, item in enumerate(produtos, start=1):
        itens_normalizados.append(
            {
                "produtoId": item.get("produtoId", idx_item),
                "produtoNome": item.get("produtoNome") or item.get("nomeProduto") or "Produto",
                "categoriaNome": item.get("categoriaNome") or item.get("categoria") or "Sem categoria",
                "quantidade": int(item.get("quantidade", 1)),
                "precoUnitario": float(item.get("precoUnitario", 0.0)),
                "adicionais": item.get("adicionais") or [],
                "subtotal": float(item.get("subtotal", 0.0)),
            }
        )

    metodo_bruto = str(pagamento.get("metodo") or registro.get("formaPagamento") or "MERCADO_PAGO").upper()
    if "MERCADO" in metodo_bruto:
        forma_pagamento = "MERCADO_PAGO"
    elif "PIX" in metodo_bruto:
        forma_pagamento = "PIX"
    elif "CART" in metodo_bruto:
        forma_pagamento = "CARTAO"
    elif "DINH" in metodo_bruto:
        forma_pagamento = "DINHEIRO"
    else:
        forma_pagamento = metodo_bruto

    status_bruto = str(registro.get("status") or pagamento.get("status") or "RECEBIDO").upper()

    return {
        "id": registro.get("id", indice),
        "codigo": registro.get("codigo") or registro.get("codigoPedido") or f"QF-{indice:06d}",
        "status": status_bruto,
        "formaPagamento": forma_pagamento,
        "criadoEm": registro.get("criadoEm") or registro.get("dataHora") or datetime.now().isoformat(),
        "cidade": registro.get("cidade") or "Sao Paulo",
        "bairro": registro.get("bairro") or "Centro",
        "usuario": registro.get("usuario") or {"id": 0, "nome": "Cliente", "email": "—"},
        "subtotal": float(registro.get("subtotal", resumo.get("subtotal", 0.0))),
        "taxaEntrega": float(registro.get("taxaEntrega", resumo.get("taxaEntrega", 0.0))),
        "total": float(registro.get("total", resumo.get("valorTotal", 0.0))),
        "itens": itens_normalizados,
    }


def normalizar_relatorio(dados: Any, origem: str = "pedidos.json") -> dict[str, Any]:
    """Garante que diferentes formatos de JSON (pedidos.json, lista de pedidos ou
    compra individual) sejam convertidos para o contrato esperado pelo dashboard.
    """
    if isinstance(dados, dict) and "pedidos" in dados and isinstance(dados["pedidos"], list):
        dados.setdefault("origem", origem)
        return dados

    if isinstance(dados, list):
        pedidos_lista = [
            normalizar_registro_compra(item, i + 1) if "compraId" in item else item
            for i, item in enumerate(dados)
        ]
        faturamento = sum(float(p.get("total", 0.0)) for p in pedidos_lista)
        return {
            "geradoEm": datetime.now().isoformat(),
            "totalPedidos": len(pedidos_lista),
            "faturamentoTotal": round(faturamento, 2),
            "pedidos": pedidos_lista,
            "origem": origem,
        }

    if isinstance(dados, dict) and ("compraId" in dados or "codigoPedido" in dados):
        pedido = normalizar_registro_compra(dados, 1)
        return {
            "geradoEm": dados.get("dataHora") or datetime.now().isoformat(),
            "totalPedidos": 1,
            "faturamentoTotal": pedido["total"],
            "pedidos": [pedido],
            "origem": origem,
        }

    raise ValueError("Estrutura de arquivo nao reconhecida como relatorio de pedidos do QFOME.")


def converter_csv_para_relatorio(conteudo_bytes: bytes, nome_arquivo: str) -> dict[str, Any]:
    """Permite importar uma planilha CSV de pedidos diretamente no dashboard."""
    try:
        df_csv = pd.read_csv(io.BytesIO(conteudo_bytes), encoding="utf-8")
    except UnicodeDecodeError:
        df_csv = pd.read_csv(io.BytesIO(conteudo_bytes), encoding="latin-1")

    mapa_colunas = {c.lower().strip(): c for c in df_csv.columns}

    def obter_coluna(*candidatas: str) -> str | None:
        for cand in candidatas:
            if cand.lower() in mapa_colunas:
                return mapa_colunas[cand.lower()]
        return None

    col_codigo = obter_coluna("codigo", "código", "codigopedido", "id")
    col_data = obter_coluna("criadoem", "data", "datahora", "created_at")
    col_status = obter_coluna("status", "situacao")
    col_pagamento = obter_coluna("formapagamento", "pagamento", "metodo")
    col_cliente = obter_coluna("usuario.nome", "cliente", "nome")
    col_cidade = obter_coluna("cidade")
    col_subtotal = obter_coluna("subtotal", "subtotal (r$)")
    col_entrega = obter_coluna("taxaentrega", "entrega", "entrega (r$)")
    col_total = obter_coluna("total", "total (r$)", "valortotal")
    col_produto = obter_coluna("produto", "item.produtonome", "nomeproduto")
    col_categoria = obter_coluna("categoria", "item.categorianome")
    col_qtd = obter_coluna("quantidade", "item.quantidade", "qtd")

    pedidos_construidos = []
    for idx, linha in df_csv.iterrows():
        total_val = float(linha[col_total]) if col_total and pd.notna(linha[col_total]) else 0.0
        entrega_val = float(linha[col_entrega]) if col_entrega and pd.notna(linha[col_entrega]) else 0.0
        subtotal_val = (
            float(linha[col_subtotal])
            if col_subtotal and pd.notna(linha[col_subtotal])
            else max(total_val - entrega_val, 0.0)
        )
        qtd_val = int(linha[col_qtd]) if col_qtd and pd.notna(linha[col_qtd]) else 1
        nome_prod = str(linha[col_produto]) if col_produto and pd.notna(linha[col_produto]) else "Pedido importado"
        nome_cat = str(linha[col_categoria]) if col_categoria and pd.notna(linha[col_categoria]) else "Geral"

        pedidos_construidos.append(
            {
                "id": idx + 1,
                "codigo": str(linha[col_codigo]) if col_codigo and pd.notna(linha[col_codigo]) else f"QF-{idx + 1:04d}",
                "status": str(linha[col_status]).upper() if col_status and pd.notna(linha[col_status]) else "RECEBIDO",
                "formaPagamento": (
                    str(linha[col_pagamento]).upper()
                    if col_pagamento and pd.notna(linha[col_pagamento])
                    else "PIX"
                ),
                "criadoEm": (
                    str(linha[col_data])
                    if col_data and pd.notna(linha[col_data])
                    else datetime.now().isoformat()
                ),
                "cidade": str(linha[col_cidade]) if col_cidade and pd.notna(linha[col_cidade]) else "Sao Paulo",
                "bairro": "Centro",
                "usuario": {
                    "id": idx + 1,
                    "nome": str(linha[col_cliente]) if col_cliente and pd.notna(linha[col_cliente]) else "Cliente",
                    "email": "—",
                },
                "subtotal": round(subtotal_val, 2),
                "taxaEntrega": round(entrega_val, 2),
                "total": round(total_val, 2),
                "itens": [
                    {
                        "produtoId": 1,
                        "produtoNome": nome_prod,
                        "categoriaNome": nome_cat,
                        "quantidade": qtd_val,
                        "precoUnitario": round(subtotal_val / max(qtd_val, 1), 2),
                        "adicionais": [],
                        "subtotal": round(subtotal_val, 2),
                    }
                ],
            }
        )

    return normalizar_relatorio(pedidos_construidos, origem=nome_arquivo)


# ---------------------------------------------------------------------------
# Carga dos dados
# ---------------------------------------------------------------------------
def carregar_relatorio() -> dict[str, Any] | None:
    """Fonte dos dados, na ordem escolhida na barra lateral."""
    st.sidebar.markdown(
        f"""
        <div class="qfome-sidebar-brand">
            <div class="qfome-brand-badge" style="width:40px;height:40px;border-radius:12px;">
                {icone_svg("utensils", 20, "#ffffff")}
            </div>
            <div>
                <div class="qfome-sidebar-brand-title">QFOME ANALYTICS</div>
                <div class="qfome-sidebar-brand-sub">Painel de Vendas e Estatistica</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.sidebar.markdown("##### Fonte dos dados")
    fonte = st.sidebar.radio(
        "Origem da importacao",
        ["Arquivo exportado pelo app", "API do backend", "Enviar arquivo (JSON ou CSV)"],
        help="O botao 'Exportar dados' do aplicativo gera o pedidos.json no servidor.",
    )

    if st.sidebar.button("Recarregar dados", icon=":material/refresh:", use_container_width=True):
        st.rerun()

    if fonte == "Arquivo exportado pelo app":
        caminho = st.sidebar.text_input("Caminho do pedidos.json", str(ARQUIVO_PADRAO))
        arquivo = Path(caminho)
        if not arquivo.exists():
            st.warning(
                f"Arquivo nao encontrado: `{arquivo}`.\n\n"
                "Abra o aplicativo QFOME, acesse **Area do cliente -> Exportar dados (JSON)** "
                "e toque em **Gerar JSON dos pedidos**.",
                icon=":material/folder_off:",
            )
            return None
        try:
            bruto = json.loads(arquivo.read_text(encoding="utf-8"))
            return normalizar_relatorio(bruto, origem=arquivo.name)
        except Exception as erro:
            st.error(f"Erro ao ler o arquivo `{arquivo.name}`: {erro}", icon=":material/error:")
            return None

    if fonte == "API do backend":
        url = st.sidebar.text_input("Endpoint do relatorio", API_PADRAO)
        try:
            resposta = requests.get(url, timeout=10)
            resposta.raise_for_status()
            return normalizar_relatorio(resposta.json(), origem="API REST")
        except requests.RequestException as erro:
            st.warning(
                f"Nao foi possivel consultar a API (`{url}`): {erro}",
                icon=":material/cloud_off:",
            )
            return None

    enviado = st.sidebar.file_uploader(
        "Selecione pedidos.json ou planilha .csv",
        type=["json", "csv"],
    )
    if enviado is None:
        st.info(
            "Envie na barra lateral o arquivo `pedidos.json` exportado pelo aplicativo ou uma planilha `.csv`.",
            icon=":material/upload_file:",
        )
        return None

    try:
        conteudo = enviado.getvalue()
        if enviado.name.lower().endswith(".csv"):
            return converter_csv_para_relatorio(conteudo, enviado.name)
        dados_json = json.loads(conteudo.decode("utf-8"))
        return normalizar_relatorio(dados_json, origem=enviado.name)
    except Exception as erro:
        st.error(f"Nao foi possivel importar `{enviado.name}`: {erro}", icon=":material/error:")
        return None


def montar_tabelas(relatorio: dict[str, Any]) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Uma linha por pedido e uma linha por item de pedido."""
    lista_pedidos = relatorio.get("pedidos") or []
    pedidos = pd.json_normalize(lista_pedidos)
    if pedidos.empty:
        return pedidos, pedidos

    pedidos["criadoEm"] = converter_data_hora(pedidos["criadoEm"])
    pedidos["dia"] = pedidos["criadoEm"].dt.date

    if "usuario.nome" not in pedidos.columns:
        pedidos["usuario.nome"] = "Cliente nao identificado"
    else:
        pedidos["usuario.nome"] = pedidos["usuario.nome"].fillna("Cliente nao identificado")

    if "cidade" not in pedidos.columns:
        pedidos["cidade"] = "Nao informada"
    else:
        pedidos["cidade"] = pedidos["cidade"].fillna("Nao informada")

    for col_num in ("subtotal", "taxaEntrega", "total"):
        if col_num not in pedidos.columns:
            pedidos[col_num] = 0.0
        pedidos[col_num] = pd.to_numeric(pedidos[col_num], errors="coerce").fillna(0.0)

    pedidos["formaPagamentoRotulo"] = (
        pedidos["formaPagamento"].astype(str).map(lambda x: ROTULOS_PAGAMENTO.get(x, x.replace("_", " ").title()))
    )
    pedidos["statusRotulo"] = (
        pedidos["status"].astype(str).map(lambda x: ROTULOS_STATUS.get(x, x.replace("_", " ").title()))
    )

    pedidos_com_itens = [
        {**p, "itens": p.get("itens") or []}
        for p in lista_pedidos
    ]
    itens = pd.json_normalize(
        pedidos_com_itens,
        record_path="itens",
        meta=["codigo", "criadoEm"],
        record_prefix="item.",
    )

    if not itens.empty:
        itens["criadoEm"] = converter_data_hora(itens["criadoEm"])
        if "item.categoriaNome" not in itens.columns:
            itens["item.categoriaNome"] = "Sem categoria"
        else:
            itens["item.categoriaNome"] = itens["item.categoriaNome"].fillna("Sem categoria")
        itens["item.quantidade"] = pd.to_numeric(itens["item.quantidade"], errors="coerce").fillna(0).astype(int)
        itens["item.subtotal"] = pd.to_numeric(itens["item.subtotal"], errors="coerce").fillna(0.0)
    else:
        itens = pd.DataFrame(
            columns=[
                "item.produtoId",
                "item.produtoNome",
                "item.categoriaNome",
                "item.quantidade",
                "item.precoUnitario",
                "item.subtotal",
                "codigo",
                "criadoEm",
            ]
        )

    return pedidos, itens


# ---------------------------------------------------------------------------
# Filtros interativos na barra lateral
# ---------------------------------------------------------------------------
def aplicar_filtros(
    pedidos: pd.DataFrame, itens: pd.DataFrame
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Aplica filtros de periodo, forma de pagamento e categoria na barra lateral."""
    st.sidebar.markdown("---")
    st.sidebar.markdown("##### Filtros de analise")

    datas_validas = pedidos["dia"].dropna()
    if not datas_validas.empty:
        data_min = datas_validas.min()
        data_max = datas_validas.max()
        intervalo = st.sidebar.date_input(
            "Periodo dos pedidos",
            value=(data_min, data_max),
            min_value=data_min,
            max_value=data_max,
            format="DD/MM/YYYY",
        )
    else:
        intervalo = ()

    opcoes_pagamento = sorted(pedidos["formaPagamentoRotulo"].dropna().unique().tolist())
    pagamentos_sel = st.sidebar.multiselect(
        "Forma de pagamento",
        options=opcoes_pagamento,
        default=opcoes_pagamento,
        placeholder="Todas as formas",
    )

    opcoes_categoria = (
        sorted(itens["item.categoriaNome"].dropna().unique().tolist())
        if not itens.empty
        else []
    )
    categorias_sel = st.sidebar.multiselect(
        "Categoria do cardapio",
        options=opcoes_categoria,
        default=opcoes_categoria,
        placeholder="Todas as categorias",
    )

    pedidos_filtrados = pedidos.copy()
    if isinstance(intervalo, (tuple, list)) and len(intervalo) == 2:
        inicio, fim = intervalo
        pedidos_filtrados = pedidos_filtrados[
            (pedidos_filtrados["dia"] >= inicio) & (pedidos_filtrados["dia"] <= fim)
        ]

    if pagamentos_sel:
        pedidos_filtrados = pedidos_filtrados[
            pedidos_filtrados["formaPagamentoRotulo"].isin(pagamentos_sel)
        ]
    else:
        pedidos_filtrados = pedidos_filtrados.iloc[0:0]

    itens_filtrados = itens[itens["codigo"].isin(pedidos_filtrados["codigo"])].copy()
    if opcoes_categoria:
        if categorias_sel:
            itens_filtrados = itens_filtrados[
                itens_filtrados["item.categoriaNome"].isin(categorias_sel)
            ]
            if len(categorias_sel) < len(opcoes_categoria):
                pedidos_filtrados = pedidos_filtrados[
                    pedidos_filtrados["codigo"].isin(itens_filtrados["codigo"])
                ]
        else:
            itens_filtrados = itens_filtrados.iloc[0:0]
            pedidos_filtrados = pedidos_filtrados.iloc[0:0]

    return pedidos_filtrados, itens_filtrados


# ---------------------------------------------------------------------------
# Graficos executivos (Plotly com identidade QFOME)
# ---------------------------------------------------------------------------
def aplicar_estilo(fig: go.Figure, *, horizontal: bool = False, altura: int = 340) -> go.Figure:
    fig.update_layout(
        height=altura,
        plot_bgcolor=COR_CARTAO,
        paper_bgcolor=COR_CARTAO,
        font=dict(color=COR_TINTA_SUAVE, family="Manrope, Segoe UI, system-ui, sans-serif", size=12),
        title=dict(
            font=dict(color=COR_TINTA, size=15, family="Manrope, Segoe UI, sans-serif"),
            x=0.01,
            xanchor="left",
        ),
        margin=dict(l=12, r=44, t=46, b=16),
        showlegend=False,
        hoverlabel=dict(
            bgcolor=COR_PAINEL_ESCURO,
            font_size=12,
            font_family="Manrope, Segoe UI, sans-serif",
            font_color="#ffe5d0",
            bordercolor="#75443a",
        ),
        bargap=0.28,
    )
    eixo_valor = dict(
        gridcolor=COR_GRADE,
        zerolinecolor=COR_GRADE,
        tickfont=dict(color=COR_ROTULO, size=11),
        automargin=True,
    )
    eixo_rotulo = dict(
        showgrid=False,
        tickfont=dict(color=COR_TINTA, size=12),
        automargin=True,
    )
    if horizontal:
        fig.update_xaxes(**eixo_valor)
        fig.update_yaxes(**eixo_rotulo)
    else:
        fig.update_yaxes(**eixo_valor)
        fig.update_xaxes(**eixo_rotulo)
    return fig


def grafico_faturamento_por_dia(pedidos: pd.DataFrame) -> go.Figure:
    por_dia = (
        pedidos.groupby("dia", as_index=False)
        .agg(total=("total", "sum"), qtd_pedidos=("codigo", "count"))
        .sort_values("dia")
    )
    por_dia["dia_rotulo"] = pd.to_datetime(por_dia["dia"]).dt.strftime("%d/%m")
    por_dia["rotulo_valor"] = por_dia["total"].map(formatar_moeda)

    fig = px.bar(
        por_dia,
        x="dia_rotulo",
        y="total",
        text="rotulo_valor",
        custom_data=["qtd_pedidos"],
        title="Faturamento diario (R$)",
    )
    fig.update_traces(
        marker_color=COR_MARCA,
        marker_line_color=COR_MARCA_PROFUNDA,
        marker_line_width=0.5,
        marker_cornerradius=7,
        textposition="outside",
        cliponaxis=False,
        textfont=dict(color=COR_TINTA, size=11),
        hovertemplate="<b>Dia %{x}</b><br>Faturamento: R$ %{y:,.2f}<br>Pedidos: %{customdata[0]}<extra></extra>",
    )
    max_y = float(por_dia["total"].max()) if not por_dia.empty else 100.0
    fig.update_xaxes(title=None, type="category")
    fig.update_yaxes(title=None, tickprefix="R$ ", range=[0, max_y * 1.22])
    return aplicar_estilo(fig, altura=330)


def grafico_barras_horizontais(
    dados: pd.DataFrame,
    categoria: str,
    valor: str,
    titulo: str,
    *,
    dinheiro: bool,
    cor: str = COR_MARCA,
    mapa_cores: dict[str, str] | None = None,
) -> go.Figure:
    ordenado = dados.sort_values(valor, ascending=True).copy()
    if dinheiro:
        ordenado["rotulo_exibicao"] = ordenado[valor].map(formatar_moeda)
    else:
        ordenado["rotulo_exibicao"] = ordenado[valor].astype(str)

    cores_barras = (
        [mapa_cores.get(str(cat), cor) for cat in ordenado[categoria]]
        if mapa_cores
        else cor
    )

    fig = px.bar(
        ordenado,
        x=valor,
        y=categoria,
        orientation="h",
        title=titulo,
        text="rotulo_exibicao",
    )
    if dinheiro:
        fig.update_traces(
            hovertemplate="<b>%{y}</b><br>Receita: R$ %{x:,.2f}<extra></extra>",
        )
        fig.update_xaxes(tickprefix="R$ ")
    else:
        fig.update_traces(
            hovertemplate="<b>%{y}</b><br>Pedidos: %{x}<extra></extra>",
        )

    max_x = float(ordenado[valor].max()) if not ordenado.empty else 10.0
    fig.update_traces(
        marker_color=cores_barras,
        marker_cornerradius=6,
        textposition="outside",
        cliponaxis=False,
        textfont=dict(color=COR_TINTA, size=11),
    )
    fig.update_xaxes(title=None, range=[0, max_x * 1.28])
    fig.update_yaxes(title=None)
    return aplicar_estilo(fig, horizontal=True, altura=340)


# ---------------------------------------------------------------------------
# Renderizacao da Pagina
# ---------------------------------------------------------------------------
injetar_estilos()

relatorio = carregar_relatorio()

gerado_em_fmt = (
    formatar_instante_exportacao(relatorio.get("geradoEm"))
    if relatorio
    else "Aguardando importacao"
)
origem_dados = relatorio.get("origem", "pedidos.json") if relatorio else "Nenhuma"
total_exportado = relatorio.get("totalPedidos", 0) if relatorio else 0

st.markdown(
    f"""
    <div class="qfome-hero">
        <div class="qfome-hero-left">
            <div class="qfome-brand-badge">
                {icone_svg("bar-chart", 26, "#ffffff")}
            </div>
            <div>
                <div class="qfome-eyebrow">Analise de Dados e Estatistica · Item 2.5</div>
                <h1 class="qfome-hero-title">DASHBOARD <span>QFOME</span></h1>
                <p class="qfome-hero-sub">
                    Monitoramento executivo dos pedidos exportados pelo aplicativo mobile e backend
                    (<code>Exportar dados &rarr; pedidos.json</code>).
                </p>
            </div>
        </div>
        <div class="qfome-meta-pills">
            <div class="qfome-pill">
                {icone_svg("database", 18, "#ffd08e")}
                <div>
                    <span class="qfome-pill-label">Fonte ativa</span>
                    <span class="qfome-pill-value">{origem_dados}</span>
                </div>
            </div>
            <div class="qfome-pill">
                {icone_svg("calendar", 18, "#ffd08e")}
                <div>
                    <span class="qfome-pill-label">Exportado em</span>
                    <span class="qfome-pill-value">{gerado_em_fmt}</span>
                </div>
            </div>
            <div class="qfome-pill">
                {icone_svg("shopping-bag", 18, "#ffd08e")}
                <div>
                    <span class="qfome-pill-label">Registros no arquivo</span>
                    <span class="qfome-pill-value">{total_exportado} pedidos</span>
                </div>
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

if relatorio is None:
    st.stop()

pedidos_brutos, itens_brutos = montar_tabelas(relatorio)

if pedidos_brutos.empty:
    st.info(
        "Ainda nao ha pedidos no arquivo exportado. Realize pedidos no aplicativo QFOME e exporte novamente.",
        icon=":material/info:",
    )
    st.stop()

pedidos, itens = aplicar_filtros(pedidos_brutos, itens_brutos)

if pedidos.empty:
    st.warning(
        "Nenhum pedido corresponde aos filtros selecionados na barra lateral. Ajuste o periodo ou as categorias.",
        icon=":material/filter_alt_off:",
    )
    st.stop()

# --- Indicadores Executivos (KPI Cards com icones SVG) ---------------------
faturamento = float(pedidos["total"].sum())
subtotal_produtos = float(pedidos["subtotal"].sum())
receita_entrega = float(pedidos["taxaEntrega"].sum())
qtd_pedidos = len(pedidos)
ticket_medio = float(pedidos["total"].mean())
itens_vendidos = int(itens["item.quantidade"].sum()) if not itens.empty else 0
media_itens_pedido = itens_vendidos / qtd_pedidos if qtd_pedidos else 0.0
clientes_unicos = int(pedidos["usuario.nome"].nunique())
entregas_gratis = int((pedidos["taxaEntrega"] == 0).sum())

st.markdown(
    f"""
    <div class="qfome-kpi-grid">
        <div class="qfome-kpi-card">
            <div class="qfome-kpi-top">
                <span class="qfome-kpi-label">Faturamento Total</span>
                <div class="qfome-kpi-icon" style="background:#ffe8ea;color:{COR_MARCA};">
                    {icone_svg("wallet", 20, COR_MARCA)}
                </div>
            </div>
            <div class="qfome-kpi-value" style="color:#bf1f34;">{formatar_moeda(faturamento)}</div>
            <div class="qfome-kpi-foot">
                {icone_svg("truck", 14, COR_ROTULO)}
                <span>Produtos: {formatar_moeda(subtotal_produtos)} · Entregas: {formatar_moeda(receita_entrega)}</span>
            </div>
        </div>
        <div class="qfome-kpi-card">
            <div class="qfome-kpi-top">
                <span class="qfome-kpi-label">Pedidos Realizados</span>
                <div class="qfome-kpi-icon" style="background:#fff0db;color:#c96a16;">
                    {icone_svg("shopping-bag", 20, "#c96a16")}
                </div>
            </div>
            <div class="qfome-kpi-value">{qtd_pedidos}</div>
            <div class="qfome-kpi-foot">
                {icone_svg("users", 14, COR_ROTULO)}
                <span>{clientes_unicos} clientes unicos · {entregas_gratis} com frete gratis</span>
            </div>
        </div>
        <div class="qfome-kpi-card">
            <div class="qfome-kpi-top">
                <span class="qfome-kpi-label">Ticket Medio</span>
                <div class="qfome-kpi-icon" style="background:#eaf9ef;color:{COR_VERDE};">
                    {icone_svg("trending-up", 20, COR_VERDE)}
                </div>
            </div>
            <div class="qfome-kpi-value">{formatar_moeda(ticket_medio)}</div>
            <div class="qfome-kpi-foot">
                {icone_svg("activity", 14, COR_ROTULO)}
                <span>Mediana: {formatar_moeda(float(pedidos["total"].median()))} por pedido</span>
            </div>
        </div>
        <div class="qfome-kpi-card">
            <div class="qfome-kpi-top">
                <span class="qfome-kpi-label">Itens Vendidos</span>
                <div class="qfome-kpi-icon" style="background:#e8f2fa;color:{COR_AZUL_ACO};">
                    {icone_svg("package-check", 20, COR_AZUL_ACO)}
                </div>
            </div>
            <div class="qfome-kpi-value">{itens_vendidos}</div>
            <div class="qfome-kpi-foot">
                {icone_svg("layers", 14, COR_ROTULO)}
                <span>Media de {media_itens_pedido:.1f} itens por pedido</span>
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# --- Resumo Estatistico (Analise de Dados e Estatistica) -------------------
desvio_padrao = float(pedidos["total"].std(ddof=1)) if len(pedidos) > 1 else 0.0
valor_min = float(pedidos["total"].min())
valor_max = float(pedidos["total"].max())
quartil_25 = float(pedidos["total"].quantile(0.25))
quartil_75 = float(pedidos["total"].quantile(0.75))
coef_variacao = (desvio_padrao / ticket_medio * 100.0) if ticket_medio > 0 else 0.0

cabecalho_secao(
    "activity",
    "Resumo Estatistico dos Pedidos",
    "Medidas de tendencia central e dispersao (valor total por pedido)",
)

st.markdown(
    f"""
    <div class="qfome-stats-strip">
        <div class="qfome-stat-item">
            <div class="qfome-stat-item-label">Media Aritmetica</div>
            <div class="qfome-stat-item-value">{formatar_moeda(ticket_medio)}</div>
            <div class="qfome-stat-item-hint">Valor medio por pedido</div>
        </div>
        <div class="qfome-stat-item">
            <div class="qfome-stat-item-label">Mediana (Q2)</div>
            <div class="qfome-stat-item-value">{formatar_moeda(float(pedidos["total"].median()))}</div>
            <div class="qfome-stat-item-hint">50% dos pedidos ate este valor</div>
        </div>
        <div class="qfome-stat-item">
            <div class="qfome-stat-item-label">Desvio-Padrao</div>
            <div class="qfome-stat-item-value">{formatar_moeda(desvio_padrao)}</div>
            <div class="qfome-stat-item-hint">CV: {coef_variacao:.1f}% de dispersao</div>
        </div>
        <div class="qfome-stat-item">
            <div class="qfome-stat-item-label">Intervalo (Min — Max)</div>
            <div class="qfome-stat-item-value">{formatar_moeda(valor_min)} — {formatar_moeda(valor_max)}</div>
            <div class="qfome-stat-item-hint">Amplitude: {formatar_moeda(valor_max - valor_min)}</div>
        </div>
        <div class="qfome-stat-item">
            <div class="qfome-stat-item-label">Quartis (Q1 — Q3)</div>
            <div class="qfome-stat-item-value">{formatar_moeda(quartil_25)} — {formatar_moeda(quartil_75)}</div>
            <div class="qfome-stat-item-hint">IIQ: {formatar_moeda(quartil_75 - quartil_25)}</div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# --- Graficos Principais ---------------------------------------------------
cabecalho_secao(
    "bar-chart",
    "Evolucao Diaria de Faturamento",
    "Receita consolidada por data de criacao do pedido",
)
st.plotly_chart(
    grafico_faturamento_por_dia(pedidos),
    use_container_width=True,
    theme=None,
    config={"displayModeBar": False},
)

cabecalho_secao(
    "layers",
    "Desempenho do Cardapio por Categoria e Produto",
    "Participacao na receita bruta de itens vendidos",
)
col_esq, col_dir = st.columns(2)

if not itens.empty:
    receita_categoria = (
        itens.groupby("item.categoriaNome", as_index=False)["item.subtotal"]
        .sum()
        .rename(columns={"item.categoriaNome": "categoria", "item.subtotal": "receita"})
    )
    col_esq.plotly_chart(
        grafico_barras_horizontais(
            receita_categoria,
            "categoria",
            "receita",
            "Receita por categoria",
            dinheiro=True,
            mapa_cores=CORES_CATEGORIA,
        ),
        use_container_width=True,
        theme=None,
        config={"displayModeBar": False},
    )

    top_produtos = (
        itens.groupby("item.produtoNome", as_index=False)["item.subtotal"]
        .sum()
        .rename(columns={"item.produtoNome": "produto", "item.subtotal": "receita"})
        .nlargest(10, "receita")
    )
    col_dir.plotly_chart(
        grafico_barras_horizontais(
            top_produtos,
            "produto",
            "receita",
            "Top 10 produtos por receita",
            dinheiro=True,
            cor=COR_LARANJA,
        ),
        use_container_width=True,
        theme=None,
        config={"displayModeBar": False},
    )

cabecalho_secao(
    "credit-card",
    "Distribuicao Operacional de Pagamentos e Status",
    "Volume de pedidos por modalidade de pagamento e etapa de atendimento",
)
col_esq2, col_dir2 = st.columns(2)

formas = (
    pedidos["formaPagamentoRotulo"]
    .value_counts()
    .rename_axis("forma")
    .reset_index(name="pedidos")
)
col_esq2.plotly_chart(
    grafico_barras_horizontais(
        formas,
        "forma",
        "pedidos",
        "Pedidos por forma de pagamento",
        dinheiro=False,
        cor=COR_MARCA_PROFUNDA,
    ),
    use_container_width=True,
    theme=None,
    config={"displayModeBar": False},
)

status_df = (
    pedidos["statusRotulo"]
    .value_counts()
    .rename_axis("status")
    .reset_index(name="pedidos")
)
col_dir2.plotly_chart(
    grafico_barras_horizontais(
        status_df,
        "status",
        "pedidos",
        "Pedidos por status",
        dinheiro=False,
        cor=COR_VERDE,
    ),
    use_container_width=True,
    theme=None,
    config={"displayModeBar": False},
)

# --- Tabela detalhada e exportacao -----------------------------------------
cabecalho_secao(
    "table",
    "Base Detalhada de Pedidos e Itens Exportados",
    "Consulta tabular e exportacao em planilha CSV",
)

aba_pedidos, aba_itens = st.tabs(
    [
        ":material/receipt_long: Pedidos consolidados",
        ":material/restaurant_menu: Itens vendidos por pedido",
    ]
)

with aba_pedidos:
    tabela_pedidos = pedidos[
        [
            "codigo",
            "criadoEm",
            "statusRotulo",
            "formaPagamentoRotulo",
            "usuario.nome",
            "cidade",
            "subtotal",
            "taxaEntrega",
            "total",
        ]
    ].sort_values("criadoEm", ascending=False).rename(
        columns={
            "codigo": "Codigo",
            "criadoEm": "Data e Hora",
            "statusRotulo": "Status",
            "formaPagamentoRotulo": "Pagamento",
            "usuario.nome": "Cliente",
            "cidade": "Cidade",
            "subtotal": "Subtotal (R$)",
            "taxaEntrega": "Entrega (R$)",
            "total": "Total (R$)",
        }
    )

    st.dataframe(
        tabela_pedidos,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Data e Hora": st.column_config.DatetimeColumn("Data e Hora", format="DD/MM/YYYY HH:mm"),
            "Subtotal (R$)": st.column_config.NumberColumn("Subtotal (R$)", format="R$ %.2f"),
            "Entrega (R$)": st.column_config.NumberColumn("Entrega (R$)", format="R$ %.2f"),
            "Total (R$)": st.column_config.NumberColumn("Total (R$)", format="R$ %.2f"),
        },
    )

    col_dl1, col_dl2, _ = st.columns([1, 1, 2])
    csv_pedidos = tabela_pedidos.to_csv(index=False).encode("utf-8-sig")
    col_dl1.download_button(
        label="Baixar planilha de pedidos (.csv)",
        data=csv_pedidos,
        file_name="pedidos_qfome.csv",
        mime="text/csv",
        icon=":material/download:",
        use_container_width=True,
    )
    json_export = json.dumps(relatorio, indent=2, ensure_ascii=False).encode("utf-8")
    col_dl2.download_button(
        label="Baixar relatorio (.json)",
        data=json_export,
        file_name="pedidos.json",
        mime="application/json",
        icon=":material/data_object:",
        use_container_width=True,
    )

with aba_itens:
    if not itens.empty:
        tabela_itens = itens[
            [
                "codigo",
                "criadoEm",
                "item.produtoNome",
                "item.categoriaNome",
                "item.quantidade",
                "item.precoUnitario",
                "item.subtotal",
            ]
        ].sort_values("criadoEm", ascending=False).rename(
            columns={
                "codigo": "Pedido",
                "criadoEm": "Data e Hora",
                "item.produtoNome": "Produto",
                "item.categoriaNome": "Categoria",
                "item.quantidade": "Qtd.",
                "item.precoUnitario": "Preco Unit. (R$)",
                "item.subtotal": "Subtotal Item (R$)",
            }
        )
        st.dataframe(
            tabela_itens,
            use_container_width=True,
            hide_index=True,
            column_config={
                "Data e Hora": st.column_config.DatetimeColumn("Data e Hora", format="DD/MM/YYYY HH:mm"),
                "Preco Unit. (R$)": st.column_config.NumberColumn("Preco Unit. (R$)", format="R$ %.2f"),
                "Subtotal Item (R$)": st.column_config.NumberColumn("Subtotal Item (R$)", format="R$ %.2f"),
            },
        )
    else:
        st.info("Nenhum item detalhado disponivel para os filtros atuais.", icon=":material/info:")
