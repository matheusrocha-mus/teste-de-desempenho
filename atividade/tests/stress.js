// Etapa 3 - Teste de Estresse (Stress Testing)
// Pergunta: "Quantos usuários fazendo cálculos de criptografia (CPU Heavy)
//            derrubam o servidor?"
// Alvo: POST /checkout/crypto (CPU Bound - bloqueia o Event Loop).
// Análise: observe no terminal o momento em que os tempos de resposta sobem
//          exponencialmente ou ocorrem Timeouts.
//
// Execução: k6 run tests/stress.js

import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
    stages: [
        { duration: '2m', target: 200 },   // 0 -> 200 usuários em 2 minutos
        { duration: '2m', target: 500 },   // 200 -> 500 usuários em 2 minutos
        { duration: '2m', target: 1000 },  // 500 -> 1000 usuários em 2 minutos
    ],
    // Thresholds usados apenas como referência de degradação (não abortam o teste),
    // pois o objetivo é justamente encontrar o ponto de ruptura.
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.05'],
    },
};

export default function () {
    const payload = JSON.stringify({
        user: 'cliente-checkout',
        card: '4111111111111111',
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(`${BASE_URL}/checkout/crypto`, payload, params);

    check(res, {
        'status é 201': (r) => r.status === 201,
        'transação segura': (r) => r.json('status') === 'SECURE_TRANSACTION',
    });

    // Sem sleep: queremos pressionar a CPU o máximo possível.
}
