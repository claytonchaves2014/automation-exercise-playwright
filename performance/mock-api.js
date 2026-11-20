const http = require("node:http");

const HOST = "127.0.0.1";
const PORT = 8080;

const productsResponse = JSON.stringify({
  products: [{ id: 1, name: "Produto de teste" }]
});

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (request.method === "GET" && request.url === "/api/products") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(productsResponse);
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ message: "Rota não encontrada" }));
});

server.listen(PORT, HOST, () => {
  console.log(`API de mock disponível em http://${HOST}:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close());
}
