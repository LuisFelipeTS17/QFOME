// String.trim() e String.isBlank() do Java, que nao tratam os mesmos caracteres que o trim() do JS.

/** String.trim(): remove das pontas os caracteres ate U+0020 (espaco e controles). */
export function trim(texto) {
  return texto.replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '');
}

/** String.isBlank(): vazio ou so espacos em branco (Character.isWhitespace). */
export function isBlank(texto) {
  return /^[\t-\r\u001C-\u001F \u1680\u2000-\u2006\u2008-\u200A\u2028\u2029\u205F\u3000]*$/.test(texto);
}
