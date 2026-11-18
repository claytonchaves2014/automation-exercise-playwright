# language: pt
@e2e
Funcionalidade: Acesso e compra na loja de demonstração
  Como cliente da loja
  Quero acessar a loja, adicionar produtos ao carrinho e concluir ou validar uma compra
  Para ter confiança no fluxo de compra

  Cenário: Acessar a loja e navegar até o formulário de entrega
    Dado que estou na página para entrar na loja
    Quando entro com usuário "standard_user" e senha "secret_sauce"
    Então a área de produtos deve estar visível
    Quando adiciono um produto ao carrinho e inicio a finalização da compra
    Então o formulário de entrega deve ser exibido

  Cenário: Recusar senha incorreta
    Dado que estou na página para entrar na loja
    Quando entro com usuário "standard_user" e senha "senha-incorreta"
    Então devo ver a mensagem de acesso "Username and password do not match"

  Cenário: Recusar usuário inexistente
    Dado que estou na página para entrar na loja
    Quando entro com usuário "usuario-inexistente" e senha "senha-incorreta"
    Então devo ver a mensagem de acesso "Username and password do not match"

  Cenário: Validar campos obrigatórios do login
    Dado que estou na página para entrar na loja
    Quando tento entrar sem preencher os campos
    Então devo ver a mensagem de acesso "Username is required"

  Cenário: Concluir compra com dados válidos
    Dado que entrei na loja com uma conta válida
    Quando adiciono um produto ao carrinho e inicio a finalização da compra
    E preencho os dados de entrega válidos
    Então o resumo do pedido deve apresentar os dados da compra
    Quando finalizo a compra
    Então a compra deve ser confirmada

  Cenário: Impedir a finalização da compra com endereço incompleto
    Dado que entrei na loja com uma conta válida
    Quando adiciono um produto ao carrinho e inicio a finalização da compra
    E tento prosseguir com o endereço incompleto
    Então devo ver a validação de endereço "Postal Code is required"

  @mobile
  Cenário: Acessar o formulário de entrega em dispositivo móvel
    Dado que estou na página para entrar na loja
    Quando entro com usuário "standard_user" e senha "secret_sauce"
    Então a área de produtos deve estar visível
    Quando adiciono um produto ao carrinho e inicio a finalização da compra
    Então o formulário de entrega deve ser exibido
