import { readBundle } from './storage.mjs';
const { draws, frequency } = await readBundle();
console.log(`검증 완료: 1~${draws.at(-1).drwNo}회, 빈도 합계 ${frequency.counts.reduce((a, b) => a + b, 0)}`);
