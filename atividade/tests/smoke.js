// Etapa 1 - Smoke Test
// Objetivo: Verificar se a API está de pé antes de iniciar testes pesados.
// Config: 1 usuário (VUser) por 30 segundos acessando /health.
// Critério de Sucesso: 100% de sucesso nas requisições.
//
// Execução: k6 run tests/smoke.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
    vus: 1,                 // 1 usuário virtual
    duration: '30s',        // por 30 segundos
    thresholds: {
        // Critério de Sucesso: 100% de sucesso (0% de erros)
        http_req_failed: ['rate==0'],
        // Como o /health responde imediatamente, mantemos uma latência baixa
        http_req_duration: ['p(95)<100'],
    },
};

export default function () {
    const res = http.get(`${BASE_URL}/health`);

    check(res, {
        'status é 200': (r) => r.status === 200,
        'corpo contém status UP': (r) => r.json('status') === 'UP',
    });

    sleep(1); // pacing: 1 requisição por segundo
}
