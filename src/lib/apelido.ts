// Sugestões de apelido para quem não tem ideia (a pessoa pode digitar o próprio).

const NOMES = ['Neurônio', 'Hemácia', 'Plaqueta', 'Alvéolo', 'Cerebelo', 'Néfron', 'Bíceps', 'Fêmur', 'Glóbulo', 'Pulmão', 'Coração', 'Vilosidade', 'Diafragma', 'Tendão', 'Leucócito', 'Pâncreas'];

// Adjetivos que não mudam com o gênero da palavra
const ADJETIVOS = ['Veloz', 'Feliz', 'Gigante', 'Valente', 'Brilhante', 'Incrível', 'Genial', 'Radiante', 'Ágil', 'Forte', 'Saltitante', 'Elegante', 'Turbo'];

function sortear<T>(lista: T[]) {
  return lista[Math.floor(Math.random() * lista.length)];
}

export function gerarApelido() {
  const n = 10 + Math.floor(Math.random() * 90);
  return `${sortear(NOMES)} ${sortear(ADJETIVOS)} ${n}`;
}

export function opcoesDeApelido(qtd = 3, max = 20) {
  const set = new Set<string>();
  while (set.size < qtd) {
    const a = gerarApelido();
    if (a.length <= max) set.add(a);
  }
  return [...set];
}
