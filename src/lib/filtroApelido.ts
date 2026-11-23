// Regras do apelido. O banco também confere formato e tamanho (supabase/schema.sql),
// mas o filtro de palavras fica aqui para dar a resposta na hora.

export const APELIDO_MIN = 3;
export const APELIDO_MAX = 20;

// Letras (com acento), números e _ ; espaços só entre palavras
const FORMATO = /^[A-Za-zÀ-ÿ0-9_]+( [A-Za-zÀ-ÿ0-9_]+)*$/;

// Palavras proibidas, já sem acento. Curtas só bloqueiam como palavra inteira.
const PROIBIDAS_TRECHO = ['merda', 'porra', 'caralh', 'buceta', 'boceta', 'piroca', 'arrombad', 'cacete', 'xoxota', 'punheta', 'vagabund', 'fdp', 'filhodaput', 'putaria', 'bosta', 'foder', 'fodase'];
const PROIBIDAS_PALAVRA = ['puta', 'viado', 'cu', 'pau', 'rola', 'xota', 'pinto', 'corno', 'foda', 'otario', 'idiota', 'burro', 'nazista', 'hitler'];

function normalizar(t: string) {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a');
}

// Devolve a mensagem de erro, ou null se o apelido pode ser usado
export function validarApelido(bruto: string): string | null {
  const a = bruto.trim();
  if (a.length < APELIDO_MIN) return `Use pelo menos ${APELIDO_MIN} letras.`;
  if (a.length > APELIDO_MAX) return `Use no máximo ${APELIDO_MAX} caracteres.`;
  if (!FORMATO.test(a)) return 'Use só letras, números, _ e um espaço entre as palavras.';
  const n = normalizar(a);
  const junto = n.replace(/[\s_]/g, '');
  const palavras = n.split(/[\s_]+/);
  if (PROIBIDAS_TRECHO.some((p) => junto.includes(p)) || palavras.some((p) => PROIBIDAS_PALAVRA.includes(p))) {
    return 'Esse apelido não pode ser usado. Escolha outro.';
  }
  return null;
}
