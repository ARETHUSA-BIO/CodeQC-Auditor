import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/health');
  const data = await res.json();
  console.log('HEALTH API:', data);
}
test();
