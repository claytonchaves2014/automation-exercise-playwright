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
├── mobile/
│   ├── specs/                      # Testes nativos com Appium
│   ├── src/pages/                  # Objetos de tela Android
│   └── download-app.js             # Download verificado do APK de demonstração
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
| Node.js | 22.23.4+, 24.22.1+ ou 26.12.1+ (CI configurado com Node 22) |
| `@playwright/test` | 1.65.1 (fixada pelo lockfile) |
| `@cucumber/cucumber` | 13.3.0 (fixada pelo lockfile) |
| K6 | 2.4.0 |
| Appium | 4.0.0 |
| Driver UiAutomator2 | 9.2.2 |
| WebdriverIO | 10.2.0 |
| Mocha | 12.0.3 |
| Aplicativo Android de demonstração | 2.2.0 |

## Dependências e instalação

Pré-requisitos: Node.js 22.23.4 ou superior, 24.22.1 ou superior, ou 26.12.1 ou superior, além de acesso à internet para baixar os navegadores e acessar os serviços de demonstração.

Execute os comandos dentro de `playwright/`:

```bash
npm ci
npx playwright install chromium
```

Os testes nativos requerem também Java, Android Studio, Android SDK/Platform Tools, um emulador Android em execução e Appium com o driver UiAutomator2. O fluxo do GitHub Actions configura um emulador Android API 35 automaticamente.

Baixe e valide o APK de demonstração e instale o driver Android do Appium:

```powershell
npm run mobile:download
npm run mobile:install-driver
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
npm run test:mobile:native # Testes do aplicativo Android com Appium
```

O fluxo do GitHub Actions executa os testes de API, E2E para computador, emulação móvel e aplicativo nativo Android em tarefas separadas a cada envio de alterações e solicitação de integração, em qualquer branch. Cada tarefa publica os relatórios como artefatos, inclusive quando ocorre uma falha. Localmente, os cenários web geram `reports/cucumber-report.html` e `reports/cucumber-report.json`; as capturas dos sete cenários E2E são anexadas ao relatório. O [relatório HTML da última execução web](reports/cucumber-report.html) também fica salvo neste projeto.

## Configuração

Os endereços dos serviços podem ser definidos por variáveis de ambiente:

| Variável | Padrão |
| --- | --- |
| `API_BASE_URL` | `https://dummyjson.com` |
| `E2E_BASE_URL` | `https://www.saucedemo.com` |

DummyJSON simula as operações de criação, atualização e remoção; os testes verificam as respostas HTTP, não a persistência dos dados. O cenário `@mobile` usa a emulação de dispositivo e da área de visualização móvel do Playwright para a aplicação web; não testa um aplicativo nativo para Android ou iOS. A loja Sauce Demo exibe informações de pagamento fictícias no resumo e não solicita o número do cartão. Por isso, o cenário negativo da compra verifica o bloqueio de um endereço incompleto.

As mensagens de erro da loja e do aplicativo de demonstração permanecem em inglês nas assertivas porque são os textos literais exibidos pelos aplicativos testados.

## Testes nativos Android com Appium

Os testes usam o [aplicativo de demonstração nativo do WebdriverIO](https://github.com/webdriverio/native-demo-app), versão 2.2.0, distribuído sob licença MIT. O APK é baixado sob demanda, validado por SHA-256 e mantido localmente em `mobile/apps/`; ele não é incluído no Git.

Inicie um emulador no Android Studio e confirme que ele aparece como dispositivo conectado:

```powershell
adb devices
```

Em um terminal, inicie o servidor Appium:

```powershell
npm run mobile:server
```

Em outro terminal, execute a suíte:

```powershell
npm run test:mobile:native
```

A suíte contém três cenários: login bem-sucedido e navegação até a tela de formulários; preenchimento e envio do cadastro; e validação de e-mail obrigatório. Os Page Objects usam identificadores nativos de acessibilidade do aplicativo. O relatório HTML e JSON, com capturas de tela, é salvo em `reports/mobile/relatorio-appium.html` e `reports/mobile/relatorio-appium.json`. O Actions executa esses cenários em um job separado com emulador Android API 35 e publica os relatórios como artefato.

O aplicativo de demonstração simula a confirmação de login e cadastro localmente; os cenários validam o comportamento nativo da interface, não um serviço real de autenticação.

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
