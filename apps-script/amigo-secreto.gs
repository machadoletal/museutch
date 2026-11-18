/**
 * Amigo Secreto — backend (Google Apps Script)
 *
 * Como o site é estático (GitHub Pages), as inscrições e o sorteio ficam aqui.
 *
 * Privacidade do sorteio: nenhum par é guardado em claro. O sorteio grava só uma
 * semente aleatória (+ lista de inscritos); o par de cada pessoa é recalculado
 * na hora em que ela informa nome + PIN. Assim nada na planilha nem nas
 * propriedades revela quem tirou quem, e o organizador não vê o resultado sem
 * querer. Quem informou e-mail recebe o par por e-mail no momento do sorteio.
 * Limite honesto: o dono do projeto Apps Script tem acesso técnico a tudo e,
 * de propósito (rodando o código com a semente), poderia calcular os pares.
 *
 * Armazenamento:
 *  - Planilha "Inscrições": nome, hash do PIN, desejos, evitar, e-mail.
 *  - Script Properties:
 *      ADMIN_KEY     chave do organizador (obrigatória)
 *      REGRAS_FIXAS  opcional, JSON {"A":"B"} = A tira B (se ambos participarem).
 *                    Fica só aqui, e não no repositório público.
 *      SORTEIO       semente + snapshot dos inscritos (gerado pelo sorteio)
 */

var ABA = 'Inscrições';
var COLS = ['criado_em', 'nome', 'pin_hash', 'desejos', 'evitar', 'email'];
var PERMITIDOS = [
  'Helô', 'Gio', 'Ana Villela', 'Gustavo', 'Jack', 'Theus', 'Isa',
  'Julia', 'Leo', 'Rapha', 'Lucky Freity', 'Hosanna', 'Tchalla',
];

/* ---------- Lógica pura do sorteio (testada em scripts/test-sorteio.mjs) ---------- */

/**
 * Sorteia um amigo para cada pessoa: ninguém tira a si mesmo nem alguém da
 * sua lista "evitar". Pares em "fixos" (quem -> quem) são aplicados antes,
 * se ambos participam. Retorna { "Nome": "Amigo" } ou null se impossível.
 *
 * @param {string[]} nomes
 * @param {Object<string,string[]>} evitar  nome -> nomes que não pode tirar
 * @param {Object<string,string>} fixos     nome -> nome que deve tirar
 * @param {function():number} [rand]        padrão Math.random
 */
function sortearPares(nomes, evitar, fixos, rand) {
  rand = rand || Math.random;
  evitar = evitar || {};
  fixos = fixos || {};
  var n = nomes.length;
  if (n < 2) return null;

  var pares = {};
  var recebidos = {};
  nomes.forEach(function (a) {
    var b = fixos[a];
    if (b && b !== a && nomes.indexOf(b) >= 0 && !recebidos[b]) {
      pares[a] = b;
      recebidos[b] = true;
    }
  });

  var doadores = nomes.filter(function (a) { return !pares[a]; });
  var alvos = nomes.filter(function (a) { return !recebidos[a]; });
  if (doadores.length === 0) return pares;

  var proibido = {};
  doadores.forEach(function (a) {
    proibido[a] = {};
    proibido[a][a] = true;
    (evitar[a] || []).forEach(function (b) { proibido[a][b] = true; });
  });

  for (var tentativa = 0; tentativa < 5000; tentativa++) {
    var emb = alvos.slice();
    for (var i = emb.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = emb[i]; emb[i] = emb[j]; emb[j] = t;
    }
    var ok = true;
    for (var k = 0; k < doadores.length; k++) {
      if (proibido[doadores[k]][emb[k]]) { ok = false; break; }
    }
    if (ok) {
      doadores.forEach(function (a, idx) { pares[a] = emb[idx]; });
      return pares;
    }
  }
  return null;
}

/* ---------- PRNG com semente (sfc32) ---------- */

function prng(seed) {
  var a = seed[0] | 0, b = seed[1] | 0, c = seed[2] | 0, d = seed[3] | 0;
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Recalcula os pares a partir do snapshot guardado em SORTEIO. */
function paresDe_(s) {
  var rand = prng(s.seed);
  for (var i = 0; i < 20; i++) rand(); // aquece o gerador
  return sortearPares(s.nomes, s.evitar, s.fixos, rand);
}

/* ---------- Hash de PIN e utilidades ---------- */

function norm_(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function hashPin_(pin, nome) {
  return Utilities.base64Encode(Utilities.computeHmacSha256Signature('auth|' + norm_(nome), String(pin)));
}

/* ---------- Infra ---------- */

function props_() { return PropertiesService.getScriptProperties(); }

function aba_() {
  // Projeto avulso: ID da planilha em SHEET_ID. Projeto vinculado à planilha: getActive().
  var id = props_().getProperty('SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function inscritos_() {
  var sh = aba_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, COLS.length).getValues().map(function (r, i) {
    return {
      linha: i + 2,
      nome: String(r[1]),
      pinHash: String(r[2]),
      desejos: String(r[3] || ''),
      evitar: String(r[4] || '').split('|').filter(Boolean),
      email: String(r[5] || ''),
    };
  });
}

function achar_(lista, nome) {
  var alvo = norm_(nome);
  for (var i = 0; i < lista.length; i++) if (norm_(lista[i].nome) === alvo) return lista[i];
  return null;
}

function permitido_(nome) {
  var alvo = norm_(nome);
  for (var i = 0; i < PERMITIDOS.length; i++) if (norm_(PERMITIDOS[i]) === alvo) return PERMITIDOS[i];
  return null;
}

function sorteio_() {
  var raw = props_().getProperty('SORTEIO');
  return raw ? JSON.parse(raw) : null;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function erro_(msg) { return json_({ ok: false, erro: msg }); }

/** Converte REGRAS_FIXAS (nomes soltos) em { nomeExatoDaLista: nomeExatoDaLista }. */
function fixosDaLista_(lista) {
  var raw = props_().getProperty('REGRAS_FIXAS');
  if (!raw) return {};
  var regras = JSON.parse(raw);
  var fixos = {};
  Object.keys(regras).forEach(function (de) {
    var a = achar_(lista, de), b = achar_(lista, regras[de]);
    if (a && b) fixos[a.nome] = b.nome;
  });
  return fixos;
}

/* ---------- Endpoints ---------- */

function doGet() {
  return json_({
    ok: true,
    sorteado: !!sorteio_(),
    permitidos: PERMITIDOS,
    participantes: inscritos_().map(function (p) { return p.nome; }),
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    switch (body.acao) {
      case 'inscrever': return inscrever_(body);
      case 'sair':      return sair_(body);
      case 'resultado': return resultado_(body);
      case 'sortear':   return sortear_(body);
      default:          return erro_('Ação desconhecida.');
    }
  } catch (err) {
    return erro_('Erro no servidor.');
  } finally {
    lock.releaseLock();
  }
}

function inscrever_(b) {
  if (sorteio_()) return erro_('O sorteio já foi realizado.');
  var nome = permitido_(b.nome);
  var pin = String(b.pin || '').trim();
  var email = String(b.email || '').trim().slice(0, 100);
  if (!nome) return erro_('Escolha seu nome na lista.');
  if (pin.length < 6 || pin.length > 20) return erro_('O PIN precisa ter de 6 a 20 caracteres.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erro_('E-mail inválido.');
  var lista = inscritos_();
  if (achar_(lista, nome)) return erro_('Essa pessoa já está inscrita.');
  var desejos = String(b.desejos || '').trim().slice(0, 300);
  var evitar = (Array.isArray(b.evitar) ? b.evitar : [])
    .map(function (x) { var p = achar_(lista, x); return p ? p.nome : null; })
    .filter(function (x) { return x && norm_(x) !== norm_(nome); });
  aba_().appendRow([new Date(), nome, hashPin_(pin, nome), desejos, evitar.join('|'), email]);
  return json_({ ok: true });
}

function sair_(b) {
  if (sorteio_()) return erro_('O sorteio já foi realizado.');
  var p = achar_(inscritos_(), b.nome);
  if (!p || p.pinHash !== hashPin_(String(b.pin || '').trim(), p.nome)) return erro_('Nome ou PIN incorretos.');
  aba_().deleteRow(p.linha);
  return json_({ ok: true });
}

function resultado_(b) {
  var s = sorteio_();
  if (!s) return erro_('O sorteio ainda não foi realizado.');
  var lista = inscritos_();
  var p = achar_(lista, b.nome);
  if (!p || p.pinHash !== hashPin_(String(b.pin || '').trim(), p.nome)) return erro_('Nome ou PIN incorretos.');
  var amigo = paresDe_(s)[p.nome];
  if (!amigo) return erro_('Você não participou deste sorteio.');
  var alvo = achar_(lista, amigo);
  return json_({ ok: true, amigo: amigo, desejos: alvo ? alvo.desejos : '' });
}

/**
 * Sorteia, grava só a semente e avisa por e-mail quem informou e-mail.
 * Não devolve nenhum par: só contagens.
 */
function sortear_(b) {
  var chave = props_().getProperty('ADMIN_KEY');
  if (!chave) return erro_('ADMIN_KEY não configurada no script.');
  if (String(b.chave || '') !== chave) return erro_('Chave do organizador incorreta.');
  if (sorteio_() && !b.refazer) return erro_('O sorteio já foi realizado.');
  var lista = inscritos_();
  var evitar = {};
  lista.forEach(function (p) { evitar[p.nome] = p.evitar; });
  var s = {
    seed: [0, 0, 0, 0].map(function () { return Math.floor(Math.random() * 4294967296); }),
    nomes: lista.map(function (p) { return p.nome; }),
    evitar: evitar,
    fixos: fixosDaLista_(lista),
  };
  var pares = paresDe_(s);
  if (!pares) return erro_('Não foi possível sortear (poucos inscritos ou restrições impossíveis).');
  props_().setProperty('SORTEIO', JSON.stringify(s));

  var enviados = 0, falhas = 0;
  lista.forEach(function (p) {
    if (!p.email) return;
    var alvo = achar_(lista, pares[p.nome]);
    var linhas = ['Oi, ' + p.nome + '!', '', 'O sorteio do amigo secreto foi realizado. Você tirou:', '', '    ' + pares[p.nome]];
    if (alvo && alvo.desejos) linhas.push('', 'Sugestões de presente: ' + alvo.desejos);
    linhas.push('', 'Shhh, é segredo! 🤫');
    if (b.refazer) linhas.push('', '(Este é um novo sorteio: ignore o e-mail anterior.)');
    var texto = linhas.join('\n');
    try {
      MailApp.sendEmail(p.email, '🎁 Seu amigo secreto', texto);
      enviados++;
    } catch (err) { falhas++; }
  });
  return json_({ ok: true, total: lista.length, emails: enviados, falhas: falhas });
}

/** Rode manualmente no editor para voltar ao estado de inscrições abertas. */
function reabrirInscricoes() {
  props_().deleteProperty('SORTEIO');
}
