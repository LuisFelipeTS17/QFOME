// Equivalente ao application.yml: cada valor pode vir de uma variavel de ambiente.

/** Senha do administrador para demonstracao; em uso real, defina ADMIN_SENHA. */
export const SENHA_ADMIN_PADRAO = 'Qfome@2026';

export function lerConfiguracao(env = process.env) {
  return {
    porta: inteiro(env.SERVER_PORT ?? '8080', 'SERVER_PORT'),
    banco: {
      // SQLite em arquivo local (./data/qfome.db, relativo a pasta onde o backend roda).
      arquivo: env.DB_PATH ?? './data/qfome.db',
      // always: roda db/schema.sql e db/data.sql a cada inicializacao; never: nao roda.
      executarScripts: opcao(env.SQL_INIT_MODE ?? 'always', ['always', 'never'], 'SQL_INIT_MODE') === 'always',
    },
    cors: {
      allowedOrigins: lista(env.APP_CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:3001,http://localhost:8081'),
      allowedHeaders: lista(env.APP_CORS_ALLOWED_HEADERS ?? 'Authorization,Content-Type,Accept,Origin,X-Requested-With'),
      allowCredentials: booleano(env.APP_CORS_ALLOW_CREDENTIALS ?? 'true', 'APP_CORS_ALLOW_CREDENTIALS'),
      maxAgeSeconds: inteiro(env.APP_CORS_MAX_AGE_SECONDS ?? '3600', 'APP_CORS_MAX_AGE_SECONDS'),
    },
    health: {
      // never | when-authorized | always. Sem autenticacao, when-authorized equivale a never.
      mostrarDetalhes: opcao(env.MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS ?? 'never',
        ['never', 'when-authorized', 'always'], 'MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS') === 'always',
    },
    dados: {
      // Pasta onde o backend grava arquivos gerados: registros de compra do
      // Mercado Pago (purchases/) e a exportacao JSON para o dashboard (exports/).
      pasta: env.DATA_DIR ?? './data',
    },
    mercadoPago: {
      // Access Token do Mercado Pago (TEST-... para sandbox). Sem token, o
      // pagamento roda em modo simulado: a API responde um link de demonstracao.
      accessToken: (env.MERCADOPAGO_ACCESS_TOKEN ?? '').trim() || null,
      urlApi: env.MERCADOPAGO_API_URL ?? 'https://api.mercadopago.com',
    },
    admin: {
      // Primeiro administrador, criado so quando o banco ainda nao tem nenhum.
      email: (env.ADMIN_EMAIL ?? '').trim() || 'admin@qfome.com',
      senha: env.ADMIN_SENHA || SENHA_ADMIN_PADRAO,
      // Duracao da sessao do login administrativo.
      sessaoMinutos: inteiro(env.ADMIN_SESSAO_MINUTOS ?? '480', 'ADMIN_SESSAO_MINUTOS'),
    },
  };
}

// Listas separadas por virgula, como o Spring converte String em String[].
function lista(valor) {
  return valor.split(',').map((item) => item.trim()).filter(Boolean);
}

function inteiro(valor, nome) {
  if (!/^\s*\d+\s*$/.test(valor)) throw new Error(`${nome} deve ser um numero inteiro: "${valor}"`);
  return Number(valor);
}

// Valores aceitos pelo Spring para boolean.
function booleano(valor, nome) {
  const texto = valor.trim().toLowerCase();
  if (['true', 'on', 'yes', '1'].includes(texto)) return true;
  if (['false', 'off', 'no', '0'].includes(texto)) return false;
  throw new Error(`${nome} deve ser true ou false: "${valor}"`);
}

function opcao(valor, opcoes, nome) {
  const texto = valor.trim().toLowerCase();
  if (!opcoes.includes(texto)) throw new Error(`${nome} deve ser ${opcoes.join(' | ')}: "${valor}"`);
  return texto;
}
