// Etapa 2 - Teste de Carga (Load Testing)
// Contexto: Promoção do Marketing com pico esperado de 50 usuários simultâneos.
// Alvo: POST /checkout/simple (I/O Bound).
// SLA: p95 da latência < 500ms e erros < 1%.
//
// Execução: k6 run tests/load.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
    stages: [
        { duration: '1m', target: 50 },  // Ramp-up: 0 -> 50 usuários em 1 minuto
        { duration: '2m', target: 50 },  // Platô: manter 50 usuários por 2 minutos
        { duration: '30s', target: 0 },  // Ramp-down: 50 -> 0 usuários em 30 segundos
    ],
    thresholds: {
        // SLA: p95 da latência deve ser menor que 500ms
        http_req_duration: ['p(95)<500'],
        // SLA: taxa de erros abaixo de 1%
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    const payload = JSON.stringify({
        item: 'produto-promocao',
        amount: 1,
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(`${BASE_URL}/checkout/simple`, payload, params);

    check(res, {
        'status é 201': (r) => r.status === 201,
        'transação aprovada': (r) => r.json('status') === 'APPROVED',
    });

    sleep(1); // pacing: simula o tempo de "pensar" do usuário
}
