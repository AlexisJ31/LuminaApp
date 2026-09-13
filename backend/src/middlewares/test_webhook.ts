import { Request, Response } from 'express';
import { validateWebhookApiKey } from './webhook.middleware';

function mockRes() {
  const res = {
    statusCode: 200,
    body: null as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    }
  };
  return res as unknown as Response & { statusCode: number; body: any };
}

function runTests() {
  console.log("🧪 Pruebas Unitarias del Middleware de Webhook...\n");
  let passed = 0;

  // Test 1: Sin encabezado -> HTTP 401
  const req1 = ({ headers: {} } as unknown) as Request;
  const res1 = mockRes();
  let next1 = false;
  validateWebhookApiKey(req1, res1, () => { next1 = true; });
  if (res1.statusCode === 401 && !next1) {
    console.log("✅ Test 1 Pasado: Sin encabezado -> 401 Unauthorized");
    passed++;
  }

  // Test 2: Clave errónea -> HTTP 401
  const req2 = ({ headers: { 'x-api-key': 'incorrecto' } } as unknown) as Request;
  const res2 = mockRes();
  let next2 = false;
  validateWebhookApiKey(req2, res2, () => { next2 = true; });
  if (res2.statusCode === 401 && !next2) {
    console.log("✅ Test 2 Pasado: Clave incorrecta -> 401 Unauthorized");
    passed++;
  }

  // Test 3: Clave correcta en x-api-key -> HTTP 200 / next()
  const req3 = ({ headers: { 'x-api-key': 'lumina_secret_webhook_key_2026' } } as unknown) as Request;
  const res3 = mockRes();
  let next3 = false;
  validateWebhookApiKey(req3, res3, () => { next3 = true; });
  if (next3 && res3.statusCode === 200) {
    console.log("✅ Test 3 Pasado: x-api-key correcto -> Autorizado (next llamado)");
    passed++;
  }

  // Test 4: Bearer token en Authorization -> HTTP 200 / next()
  const req4 = ({ headers: { 'authorization': 'Bearer lumina_secret_webhook_key_2026' } } as unknown) as Request;
  const res4 = mockRes();
  let next4 = false;
  validateWebhookApiKey(req4, res4, () => { next4 = true; });
  if (next4 && res4.statusCode === 200) {
    console.log("✅ Test 4 Pasado: Bearer token correcto -> Autorizado (next llamado)");
    passed++;
  }

  console.log(`\n🎉 ${passed}/4 pruebas pasadas exitosamente.`);
}

runTests();
