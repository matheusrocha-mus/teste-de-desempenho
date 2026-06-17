// Etapa 4 - Teste de Pico (Spike Testing)
// Contexto: comportamento de "Flash Sale" (abertura de venda de ingressos).
// Alvo: POST /checkout/simple (I/O Bound).
// Cenário: carga baixa -> salto imediato para 300 -> manter -> queda imediata.
//
// Execução: k6 run tests/spike.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
    stages: [
        { duration: '30s', target: 10 },  // Carga baixa: 10 usuários por 30s
        { duration: '10s', target: 300 }, // Salto imediato para 300 usuários em 10s
        { duration: '1m', target: 300 },  // Manter 300 usuários por 1 minuto
        { duration: '10s', target: 10 },  // Queda imediata de volta para 10 usuários
        { duration: '30s', target: 10 },  // Observa recuperação com carga baixa
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.05'],
    },
};

export default function () {
    const payload = JSON.stringify({
        item: 'ingresso-flash-sale',
        amount: 1,
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(`${BASE_URL}/checkout/simple`, payload, params);

    check(res, {
        'status é 201': (r) => r.status === 201,
        'compra aprovada': (r) => r.json('status') === 'APPROVED',
    });

    sleep(1);
}
