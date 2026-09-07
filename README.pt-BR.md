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
| **Hall da Fama** | Perfil detalhado de cada pessoa — participação, anos ativos, tipo de pérola mais frequente, linha do tempo. |
| **Bracket** | Chaveamento eliminatório para eleger a melhor pérola por votação. |

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

## Deploy

`git push` para `main` dispara o workflow [`deploy.yml`](.github/workflows/deploy.yml),
que refaz o pacote cifrado e publica no GitHub Pages. Um agendamento horário mantém o
acervo em dia com novas entradas sem precisar de push. Segredos necessários no
repositório (*Settings → Secrets and variables → Actions*): `SHEET_ID`, `SITE_PASSWORD`.

## Licença

Sem licença. Todos os direitos reservados — o código está público para consulta, mas
não é open source e não autoriza reuso, cópia ou distribuição.
