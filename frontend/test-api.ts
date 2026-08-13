import { api } from './lib/api/client';

async function test() {
  try {
    const res = await api.get('/health');
    console.log("API Test Success:", res);
  } catch (err) {
    console.error("API Test Failed:", err);
  }
}

test();
