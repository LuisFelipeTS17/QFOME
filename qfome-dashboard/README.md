# QFOME Dashboard

Dashboard executivo em Python (Streamlit) da disciplina **Analise de Dados e Estatistica**
(item 2.5 do roteiro do PI IV). Apresenta os indicadores de venda e estatisticas descritivas
do QFOME a partir dos pedidos exportados pelo aplicativo.

## Fluxo dos dados (item 2.2 do roteiro)

1. No aplicativo (`qfome-mobile`): **Area do cliente -> Exportar dados (JSON) ->
   Gerar JSON dos pedidos**.
2. O backend grava `qfome-backend-node/data/exports/pedidos.json`.
3. O dashboard le esse arquivo automaticamente, consulta `GET /relatorios/pedidos` direto na
   API, ou recebe um arquivo `.json` / planilha `.csv` por upload na barra lateral.

## Como rodar

```bash
cd qfome-dashboard
pip install -r requirements.txt
streamlit run app.py
```

Abre em `http://localhost:8501`.

## O que o dashboard apresenta

- **Indicadores executivos (KPIs)**: faturamento total (com abertura entre produtos e entregas), numero de pedidos (clientes unicos e entregas gratis), ticket medio e itens vendidos.
- **Resumo estatistico**: media aritmetica, mediana (Q2), desvio-padrao, coeficiente de variacao, intervalo (minimo e maximo), amplitude e quartis (Q1 e Q3).
- **Filtros interativos**: recorte dinamico por periodo de datas, forma de pagamento e categoria do cardapio.
- **Graficos (Plotly)**:
  - Faturamento diario (`R$`).
  - Receita por categoria e Top 10 produtos por receita.
  - Pedidos por forma de pagamento e por status.
- **Tabelas e exportacao**: consulta detalhada de pedidos e itens com download direto em planilha `.csv` e relatorio `.json`.
