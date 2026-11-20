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
├── performance/
│   ├── load.js                     # Teste de carga K6
│   └── mock-api.js                 # API local isolada para o teste de carga
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
| K6 | 2.4.0 |

## Dependências e instalação

Pré-requisitos: Node.js 22, 24 ou 26 ou superior, além de acesso à internet para baixar o navegador e acessar os serviços de demonstração.

Execute os comandos dentro de `playwright/`:

```bash
npm ci
npx playwright install chromium
```

Instale também o K6 no Windows:

```powershell
winget install --id GrafanaLabs.k6 --exact
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

## Teste de carga opcional

O teste usa uma API de mock executada somente em `127.0.0.1`; o script não envia carga a serviços públicos ou a endereços configuráveis. A execução completa aumenta a carga gradualmente, mantém 500 usuários virtuais por 5 minutos e reduz a carga ao final. Ela é manual para evitar consumir recursos em cada commit.

Em um terminal, inicie o mock:

```powershell
npm run perf:mock
```

Em outro terminal, na pasta do projeto, execute o perfil completo:

```powershell
npm run perf:load
```

Para validar a instalação rapidamente antes do perfil completo:

```powershell
npm run perf:smoke
```

O K6 salva `reports/relatorio-carga-k6.html` e `reports/relatorio-carga-k6.json`. O relatório apresenta requisições por segundo, latências, erros, verificações e os limites definidos: percentil 95 abaixo de 500 ms, taxa de falhas abaixo de 1% e verificações aprovadas acima de 99%. Esses limites são critérios iniciais para o mock local, não uma garantia de desempenho de produção.

### Resultado e análise da execução

Na execução local de 19/11/2026, o perfil manteve 500 usuários virtuais por 5 minutos e gerou 165.065 requisições, com média de 457,64 requisições por segundo. A latência média foi de 0,55 ms, o p95 foi de 1,52 ms e o máximo observado foi de 29,39 ms. Não houve falhas e as 495.195 verificações passaram. Os três limites foram atendidos.

Como o alvo é um mock local simples, esses números medem apenas este computador e o endpoint em memória; não estimam o desempenho de uma API real com rede, banco de dados ou dependências externas. Os relatórios da execução estão disponíveis em [HTML](reports/relatorio-carga-k6.html) e [JSON](reports/relatorio-carga-k6.json).
