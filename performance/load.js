import http from "k6/http";
import { check, sleep } from "k6";

const TARGET_URL = "http://127.0.0.1:8080/api/products";
const VIRTUAL_USERS = Number(__ENV.VUS || 500);
const TEST_DURATION = __ENV.DURATION || "5m";
const RAMP_DURATION = __ENV.RAMP_DURATION || "30s";

export const options = {
  scenarios: {
    carga_constante: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: RAMP_DURATION, target: VIRTUAL_USERS },
        { duration: TEST_DURATION, target: VIRTUAL_USERS },
        { duration: RAMP_DURATION, target: 0 }
      ]
    }
  },
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"]
  }
};

export default function () {
  const response = http.get(TARGET_URL);
  const products =
    response.status === 200 ? response.json().products : [];

  check(response, {
    "status HTTP 200": (result) => result.status === 200,
    "Content-Type JSON": (result) =>
      (result.headers["Content-Type"] || "").includes("application/json"),
    "resposta contém produtos": () =>
      Array.isArray(products) && products.length > 0
  });

  sleep(1);
}

function metricValue(metrics, metricName, valueName) {
  const metric = metrics[metricName];
  return metric && metric.values && metric.values[valueName] !== undefined
    ? metric.values[valueName]
    : 0;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function buildReport(data) {
  const metrics = data.metrics;
  const requests = metricValue(metrics, "http_reqs", "count");
  const failedRate = metricValue(metrics, "http_req_failed", "rate");
  const passedChecks = metricValue(metrics, "checks", "passes");
  const failedChecks = metricValue(metrics, "checks", "fails");
  const totalChecks = passedChecks + failedChecks;
  const checkRate = totalChecks === 0 ? 0 : passedChecks / totalChecks;
  const p95 = metricValue(metrics, "http_req_duration", "p(95)");
  const failurePercent = failedRate * 100;
  const checkPercent = checkRate * 100;
  const thresholds = [
    { criterio: "Latência p95 abaixo de 500 ms", aprovado: p95 < 500 },
    { criterio: "Falhas abaixo de 1%", aprovado: failurePercent < 1 },
    { criterio: "Verificações acima de 99%", aprovado: checkPercent > 99 }
  ];

  return {
    titulo: "Relatório do teste de carga",
    alvo: TARGET_URL,
    geradoEm: new Date().toISOString(),
    configuracao: {
      usuariosVirtuais: VIRTUAL_USERS,
      duracaoSustentada: TEST_DURATION,
      rampa: RAMP_DURATION,
      estrategia: "subida progressiva, carga constante e descida"
    },
    resultados: {
      requisicoes: requests,
      requisicoesPorSegundo: round(metricValue(metrics, "http_reqs", "rate")),
      usuariosVirtuaisMaximos: metricValue(metrics, "vus_max", "max"),
      falhasPercentual: round(failurePercent),
      verificacoesAprovadas: passedChecks,
      verificacoesReprovadas: failedChecks,
      verificacoesPercentual: round(checkPercent),
      latenciaMs: {
        media: round(metricValue(metrics, "http_req_duration", "avg")),
        mediana: round(metricValue(metrics, "http_req_duration", "med")),
        p90: round(metricValue(metrics, "http_req_duration", "p(90)")),
        p95: round(p95),
        maxima: round(metricValue(metrics, "http_req_duration", "max"))
      }
    },
    limites: thresholds,
    aprovado: thresholds.every((threshold) => threshold.aprovado)
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function createHtmlReport(report) {
  const status = report.aprovado ? "Aprovado" : "Reprovado";
  const rows = (items) =>
    items
      .map(
        ([label, value]) =>
          `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
      )
      .join("");
  const configurationRows = rows([
    ["Data da execução", report.geradoEm],
    ["Alvo local", report.alvo],
    ["Usuários virtuais", report.configuracao.usuariosVirtuais],
    ["Tempo em carga máxima", report.configuracao.duracaoSustentada],
    ["Duração da rampa", report.configuracao.rampa],
    ["Estratégia", report.configuracao.estrategia]
  ]);
  const resultRows = rows([
    ["Total de requisições", report.resultados.requisicoes],
    ["Requisições por segundo", report.resultados.requisicoesPorSegundo],
    ["Máximo de usuários virtuais", report.resultados.usuariosVirtuaisMaximos],
    ["Percentual de falhas", `${report.resultados.falhasPercentual}%`],
    ["Verificações aprovadas", report.resultados.verificacoesAprovadas],
    ["Verificações reprovadas", report.resultados.verificacoesReprovadas],
    ["Percentual de verificações aprovadas", `${report.resultados.verificacoesPercentual}%`]
  ]);
  const latencyRows = rows([
    ["Média", `${report.resultados.latenciaMs.media} ms`],
    ["Mediana", `${report.resultados.latenciaMs.mediana} ms`],
    ["Percentil 90", `${report.resultados.latenciaMs.p90} ms`],
    ["Percentil 95", `${report.resultados.latenciaMs.p95} ms`],
    ["Máxima", `${report.resultados.latenciaMs.maxima} ms`]
  ]);
  const thresholdRows = report.limites
    .map(
      (threshold) =>
        `<tr><td>${escapeHtml(threshold.criterio)}</td><td>${threshold.aprovado ? "Aprovado" : "Reprovado"}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Relatório do teste de carga</title>
  <style>
    body{font:16px/1.5 system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;color:#222}
    table{border-collapse:collapse;width:100%;margin:1rem 0 2rem}
    th,td{border:1px solid #ccc;padding:.6rem;text-align:left}
    th{background:#f2f2f2}
    .status{font-size:1.3rem;font-weight:700}
  </style>
</head>
<body>
  <h1>${report.titulo}</h1>
  <p class="status">Resultado geral: ${status}</p>
  <p><strong>Alvo:</strong> ${escapeHtml(report.alvo)}</p>
  <h2>Configuração da execução</h2>
  <table><tbody>${configurationRows}</tbody></table>
  <h2>Resultados gerais</h2>
  <table><tbody>${resultRows}</tbody></table>
  <h2>Latências</h2>
  <table><tbody>${latencyRows}</tbody></table>
  <h2>Limites de aprovação</h2>
  <table><thead><tr><th>Critério</th><th>Resultado</th></tr></thead><tbody>${thresholdRows}</tbody></table>
  <p>O alvo é um mock local. Os resultados não representam a capacidade de uma API de produção ou de infraestrutura externa.</p>
</body>
</html>`;
}

export function handleSummary(data) {
  const report = buildReport(data);
  const json = JSON.stringify(report, null, 2);

  return {
    "reports/relatorio-carga-k6.json": json,
    "reports/relatorio-carga-k6.html": createHtmlReport(report),
    stdout: `Resultado: ${report.aprovado ? "Aprovado" : "Reprovado"}; ${report.resultados.requisicoes} requisições; p95 ${report.resultados.latenciaMs.p95} ms.`
  };
}
