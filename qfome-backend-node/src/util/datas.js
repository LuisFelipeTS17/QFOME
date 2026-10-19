// Datas como o LocalDateTime do Java: hora local, sem fuso.

const doisDigitos = (n) => String(n).padStart(2, '0');

function partes(data) {
  return {
    dia: `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`,
    horaMinuto: `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`,
    segundos: data.getSeconds(),
    milissegundos: data.getMilliseconds(),
  };
}

/** Agora, no formato gravado no banco pelo backend Spring (sqlite-jdbc, date_class=TEXT): "2026-10-14 12:15:08.454". */
export function agora() {
  const { dia, horaMinuto, segundos, milissegundos } = partes(new Date());
  return `${dia} ${horaMinuto}:${doisDigitos(segundos)}.${String(milissegundos).padStart(3, '0')}`;
}

/** Data do banco no JSON, como o Jackson escreve LocalDateTime: "2026-10-14T12:15:08.454" (fracao sem zeros a direita). */
export function paraJson(texto) {
  if (texto == null) return null;
  const partesDoTexto = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::(\d{2})(?:\.(\d+))?)?/.exec(texto);
  if (!partesDoTexto) return texto;
  const [, dia, horaMinuto, segundos = '00', fracao = ''] = partesDoTexto;
  const fracaoSemZeros = fracao.replace(/0+$/, '');
  return `${dia}T${horaMinuto}:${segundos}${fracaoSemZeros ? `.${fracaoSemZeros}` : ''}`;
}

/** LocalDateTime.now().toString(), usado no timestamp das respostas de erro. */
export function agoraComoLocalDateTime() {
  const { dia, horaMinuto, segundos, milissegundos } = partes(new Date());
  if (segundos === 0 && milissegundos === 0) return `${dia}T${horaMinuto}`;
  const fracao = milissegundos === 0 ? '' : `.${String(milissegundos).padStart(3, '0')}`;
  return `${dia}T${horaMinuto}:${doisDigitos(segundos)}${fracao}`;
}
