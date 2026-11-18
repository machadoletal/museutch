# Museu TCH

***Português** · [English](README.md)*

**Arquivo afetivo de um grupo de amigos.** O Museu TCH reúne, cataloga e celebra as
frases, os áudios e as imagens mais icônicas que o grupo produziu desde 2020 — as
"pérolas". É um projeto pessoal, feito para quem viveu essas histórias.

> 🔒 O acervo é privado e protegido por senha. Este repositório contém apenas o
> código da aplicação — nenhum conteúdo, dado ou credencial.

## O que tem dentro

| Seção | O que é |
|---|---|
| **Acervo** | A coleção completa de pérolas, com busca e filtros (pessoa, ano, tipo, grupo) e ordenação por data. Cada pérola tem link direto (`/#grupo_id`). |
| **Jogo dos Cônjuges** | Um jogo de adivinhação: aparece uma frase, você tenta lembrar quem disse. |
| **Ranking** | Colocação das pessoas por número de pérolas no acervo. |

## Stack

- **[React 19](https://react.dev/)** + **[Vite 8](https://vite.dev/)**
- **[Tailwind CSS 3](https://tailwindcss.com/)** para o estilo
- **[lucide-react](https://lucide.dev/)** (ícones) e **[react-force-graph-2d](https://github.com/vasturiano/react-force-graph)** (visualizações)
- **GitHub Actions → GitHub Pages** para o deploy
- Dados servidos como um pacote **criptografado no build** (AES-GCM), descriptografado
  no navegador com a senha do site. A senha nunca sai do dispositivo e não está no
  código.

## Rodando localmente

Requisitos: Node 24+.

```bash
npm install
```

Crie um arquivo `.env` na raiz (não versionado) com as credenciais do acervo:

```
SHEET_ID=...
SITE_PASSWORD=...
```

```bash
npm run dev
```

O script de `predev`/`prebuild` (`scripts/build-data.mjs`) busca as entradas, cifra o
JSON com `SITE_PASSWORD` e grava `public/museu-data.enc.json`. O Vite serve/empacota
esse arquivo; o conteúdo em claro nunca toca o disco.

## Amigo secreto

A página **Amigo Secreto** permite inscrição e sorteio. Como o site é estático, o backend é um
Google Apps Script ([`apps-script/amigo-secreto.gs`](apps-script/amigo-secreto.gs)): inscrições numa
planilha; do sorteio só se guarda uma semente aleatória, e o par de cada pessoa é recalculado quando
ela informa nome + PIN. Nenhum par fica legível em lugar nenhum, nem para o organizador. Quem
informar e-mail recebe o par por e-mail na hora do sorteio. A lista de possíveis participantes está em
`PERMITIDOS` no `.gs`.

Configuração (uma vez):

1. Crie uma planilha nova → *Extensões → Apps Script* e cole o conteúdo de `amigo-secreto.gs`.
2. *Configurações do projeto → Propriedades do script*: adicione `ADMIN_KEY` (chave do organizador) e,
   opcionalmente, `REGRAS_FIXAS` (JSON como `{"A":"B"}`: A tira B, se ambos participarem; fica
   aqui e não no repositório público).
3. *Implantar → Nova implantação → App da Web*: executar como **você**, acesso **qualquer pessoa**; autorize
   o envio de e-mail quando pedido. Copie a URL `/exec`.
4. Local: `VITE_AMIGO_SECRETO_URL=<url>` no `.env`. Deploy: secret `AMIGO_SECRETO_URL` no repositório.
5. Para sortear: página Amigo Secreto → *Área do organizador* → chave → *Realizar sorteio*.

Cônjuges podem se tirar; a única restrição é a regra fixa (`REGRAS_FIXAS`). Ninguém tira a
si mesmo. Teste da lógica: `node scripts/test-sorteio.mjs`.
Atenção: o dono do projeto Apps Script tem acesso técnico e, de propósito (rodando o código com a
semente de `SORTEIO`), conseguiria calcular os pares — por isso não abra essa propriedade.

## Deploy

`git push` para `main` dispara o workflow [`deploy.yml`](.github/workflows/deploy.yml),
que refaz o pacote cifrado e publica no GitHub Pages. Um agendamento horário mantém o
acervo em dia com novas entradas sem precisar de push. Segredos necessários no
repositório (*Settings → Secrets and variables → Actions*): `SHEET_ID`, `SITE_PASSWORD`.

## Licença

Sem licença. Todos os direitos reservados — o código está público para consulta, mas
não é open source e não autoriza reuso, cópia ou distribuição.
