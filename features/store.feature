# language: pt
@e2e
Funcionalidade: Login e checkout na loja de demonstração
  Como cliente da loja
  Quero entrar, adicionar produtos ao carrinho e concluir ou validar uma compra
  Para ter confiança no fluxo de compra

  Cenário: Fazer login e navegar até o formulário do checkout
    Dado que estou na página de login da loja
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    Então a página de produtos deve estar visível
    Quando adiciono um produto ao carrinho e abro o checkout
    Então o formulário de entrega deve ser exibido

  Cenário: Recusar senha incorreta
    Dado que estou na página de login da loja
    Quando faço login com usuário "standard_user" e senha "senha-incorreta"
    Então devo ver o erro de login "Username and password do not match"

  Cenário: Recusar usuário inexistente
    Dado que estou na página de login da loja
    Quando faço login com usuário "usuario-inexistente" e senha "senha-incorreta"
    Então devo ver o erro de login "Username and password do not match"

  Cenário: Validar campos obrigatórios do login
    Dado que estou na página de login da loja
    Quando tento entrar sem preencher os campos
    Então devo ver o erro de login "Username is required"

  Cenário: Concluir compra com dados válidos
    Dado que entrei na loja com uma conta válida
    Quando adiciono um produto ao carrinho e abro o checkout
    E preencho os dados de entrega válidos
    Então o resumo do pedido deve apresentar os dados da compra
    Quando finalizo a compra
    Então a compra deve ser confirmada

  Cenário: Impedir checkout com endereço incompleto
    Dado que entrei na loja com uma conta válida
    Quando adiciono um produto ao carrinho e abro o checkout
    E tento continuar com o endereço incompleto
    Então devo ver a validação de endereço "Postal Code is required"

  @mobile
  Cenário: Acessar o formulário do checkout em viewport móvel
    Dado que estou na página de login da loja
    Quando faço login com usuário "standard_user" e senha "secret_sauce"
    Então a página de produtos deve estar visível
    Quando adiciono um produto ao carrinho e abro o checkout
    Então o formulário de entrega deve ser exibido
