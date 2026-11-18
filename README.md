# Automação do Exercício - Playwright

Projeto de testes automatizados de API e ponta a ponta com Playwright e Cucumber/Gherkin. Os cenários verificam operações HTTP positivas e negativas, além dos fluxos de acesso, carrinho e finalização da compra em uma loja de demonstração.

## Estrutura do projeto

```text
playwright/
├── features/
│   ├── api.feature                 # Cenários de contrato da API
│   ├── store.feature               # Cenários de acesso e compra
│   ├── step_definitions/           # Implementação dos passos Gherkin
│   └── support/world.js            # Contexto, navegador e ganchos do Cucumber
├── .github/workflows/              # Pipeline independente do projeto
├── reports/                        # Relatórios HTML/JSON e evidências
├── src/pages/                      # Objetos de página da loja
├── cucumber.js                     # Configuração Cucumber e formatos
├── package.json
└── package-lock.json               # Versões reprodutíveis
```

O projeto Cypress original foi preservado. Esta pasta pode ser instalada e executada de forma independente.

## Versões

| Componente | Versão |
| --- | --- |
| Node.js | 22, 24 ou 26+ (CI configurado com Node 22) |
| `@playwright/test` | 1.65.1 (fixada pelo lockfile) |
| `@cucumber/cucumber` | 13.3.0 (fixada pelo lockfile) |

## Dependências e instalação

Pré-requisitos: Node.js 22, 24 ou 26 ou superior, além de acesso à internet para baixar o navegador e acessar os serviços de demonstração.

Execute os comandos dentro de `playwright/`:

```bash
npm ci
npx playwright install chromium
```

## Executar testes e gerar relatório

```bash
npm test                 # API, E2E para computador e emulação móvel
npm run test:api         # Somente API
npm run test:e2e         # Somente E2E para computador
npm run test:mobile      # E2E com emulação de dispositivo móvel
```

O fluxo do GitHub Actions executa os testes de API, E2E para computador e emulação móvel em tarefas separadas a cada envio de alterações e solicitação de integração, em qualquer branch. Cada tarefa publica os relatórios HTML e JSON como artefatos, inclusive quando ocorre uma falha. Localmente, cada execução gera `reports/cucumber-report.html` e `reports/cucumber-report.json`; as capturas dos sete cenários E2E são anexadas ao relatório. O [relatório HTML da última execução local](reports/cucumber-report.html) também fica salvo neste projeto.

## Configuração

Os endereços dos serviços podem ser definidos por variáveis de ambiente:

| Variável | Padrão |
| --- | --- |
| `API_BASE_URL` | `https://dummyjson.com` |
| `E2E_BASE_URL` | `https://www.saucedemo.com` |

DummyJSON simula as operações de criação, atualização e remoção; os testes verificam as respostas HTTP, não a persistência dos dados. O cenário `@mobile` usa a emulação de dispositivo e da área de visualização móvel do Playwright para a aplicação web; não testa um aplicativo nativo para Android ou iOS. A loja Sauce Demo exibe informações de pagamento fictícias no resumo e não solicita o número do cartão. Por isso, o cenário negativo da compra verifica o bloqueio de um endereço incompleto.

As mensagens de erro da loja permanecem em inglês nas assertivas porque são os textos literais exibidos pela aplicação testada.
