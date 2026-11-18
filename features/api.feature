# language: pt
@api
Funcionalidade: Testes de contrato da API de produtos
  Como pessoa responsável pela qualidade
  Quero validar operações HTTP e respostas da API
  Para identificar regressões em fluxos válidos e inválidos

  Contexto:
    Dado que a API de exemplo está disponível

  Cenário: Consultar um produto existente (GET)
    Quando envio uma requisição GET para "/products/1"
    Então o status da resposta deve ser 200
    E o Content-Type da resposta deve indicar JSON
    E o campo "id" da resposta deve ser "1"

  Cenário: Criar um produto (POST)
    Quando envio uma requisição POST para "/products/add" com o JSON
      """
      {
        "title": "Produto de teste Playwright",
        "price": 19.99
      }
      """
    Então o status da resposta deve ser 201
    E o Content-Type da resposta deve indicar JSON
    E o campo "title" da resposta deve ser "Produto de teste Playwright"

  Cenário: Atualizar um produto (PUT)
    Quando envio uma requisição PUT para "/products/1" com o JSON
      """
      {
        "title": "Produto atualizado pelo Playwright",
        "price": 25.5
      }
      """
    Então o status da resposta deve ser 200
    E o Content-Type da resposta deve indicar JSON
    E o campo "title" da resposta deve ser "Produto atualizado pelo Playwright"

  Cenário: Remover um produto (DELETE)
    Quando envio uma requisição DELETE para "/products/1"
    Então o status da resposta deve ser 200
    E o Content-Type da resposta deve indicar JSON
    E o campo "isDeleted" da resposta deve ser verdadeiro

  Cenário: Rejeitar um método não suportado para um produto
    Quando envio uma requisição POST para "/products/1"
    Então o status da resposta deve ser 404
    E o Content-Type da resposta deve indicar HTML
    E o corpo da resposta deve conter "Cannot POST /products/1"

  Cenário: Rejeitar um corpo JSON malformado
    Quando envio uma requisição POST para "/products/add" com JSON malformado
      """
      {"title":
      """
    Então o status da resposta deve ser 400
    E o Content-Type da resposta deve indicar JSON
    E a resposta deve conter uma mensagem de erro

  Cenário: Rejeitar autenticação sem credenciais
    Quando envio uma requisição POST para "/auth/login" com o JSON
      """
      {}
      """
    Então o status da resposta deve ser 400
    E o Content-Type da resposta deve indicar JSON
    E a resposta deve conter uma mensagem de erro

  Cenário: Rejeitar autenticação com credenciais inválidas
    Quando envio uma requisição POST para "/auth/login" com o JSON
      """
      {
        "username": "invalid-user",
        "password": "invalid-password"
      }
      """
    Então o status da resposta deve ser 400
    E o Content-Type da resposta deve indicar JSON
    E a resposta deve conter uma mensagem de erro

  Cenário: Retornar erro ao consultar um produto inexistente
    Quando envio uma requisição GET para "/products/999999"
    Então o status da resposta deve ser 404
    E o Content-Type da resposta deve indicar JSON
    E a resposta deve conter uma mensagem de erro
