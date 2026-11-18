# Automation Exercise - Playwright

Projeto de automação de testes de API e E2E com Playwright e Cucumber/Gherkin. Os cenários verificam operações HTTP positivas e negativas e o fluxo de login, carrinho e checkout de uma loja de demonstração.

## Arquitetura

```text
playwright/
├── features/
│   ├── api.feature                 # Cenários de contrato da API
│   ├── store.feature               # Cenários de login e checkout
│   ├── step_definitions/           # Implementação dos passos Gherkin
│   └── support/world.js            # Contexto, browser e hooks Cucumber
├── .github/workflows/              # Pipeline independente do projeto
├── reports/                        # Relatórios HTML/JSON e evidências
├── src/pages/                      # Page Objects da loja
├── cucumber.js                     # Configuração Cucumber e formatos
├── package.json
└── package-lock.json               # Versões reprodutíveis
```

O Cypress original foi preservado; esta pasta pode ser instalada e executada de forma independente.

## Versões

| Componente | Versão |
| --- | --- |
| Node.js | 22, 24 ou 26+ (CI configurado com Node 22) |
| `@playwright/test` | 1.65.1 (fixada pelo lockfile) |
| `@cucumber/cucumber` | 13.3.0 (fixada pelo lockfile) |

## Dependências e instalação

Pré-requisitos: Node.js 22, 24 ou 26+ e acesso à internet para baixar o navegador e acessar os serviços de demonstração.

Execute os comandos dentro de `playwright/`:

```bash
npm ci
npx playwright install chromium
```

## Executar testes e gerar relatório

```bash
npm test                 # API e E2E
npm run test:api          # Apenas API
npm run test:e2e          # Apenas E2E desktop
npm run test:mobile       # E2E com emulação de viewport/dispositivo móvel
```

O workflow do GitHub Actions executa API, E2E desktop e mobile em jobs separados em cada push e pull request, em qualquer branch. Cada job publica seus relatórios HTML/JSON como artefato, inclusive em caso de falha. Localmente, cada execução gera `reports/cucumber-report.html` e `reports/cucumber-report.json`; as capturas dos sete cenários E2E são anexadas ao relatório. O [relatório HTML da última execução local](reports/cucumber-report.html) também fica salvo neste projeto.

## Configuração

As URLs podem ser definidas por variáveis de ambiente:

| Variável | Padrão |
| --- | --- |
| `API_BASE_URL` | `https://dummyjson.com` |
| `E2E_BASE_URL` | `https://www.saucedemo.com` |

DummyJSON simula as mutações de criação, atualização e remoção; os testes verificam as respostas HTTP e não a persistência. O cenário `@mobile` usa emulação de dispositivo/viewport móvel do Playwright para a aplicação web; não é um teste de aplicativo nativo Android/iOS. A Sauce Demo usa informações de pagamento fictícias no resumo e não solicita número de cartão. Por isso, o cenário negativo do checkout valida o bloqueio de endereço incompleto.
