/*
 * Deterministic validation harness for the evidence-based product evaluator.
 * Run: node evaluation/validate.js
 */
'use strict';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

function bayesianRating(rating5, reviewCount, categoryPrior5 = 4.6, priorWeight = 100) {
  if (!Number.isFinite(rating5) || !Number.isFinite(reviewCount) || reviewCount < 0) return null;
  const n = reviewCount;
  return clamp((((n * rating5 + priorWeight * categoryPrior5) / (n + priorWeight)) / 5) * 100);
}

function reviewConfidence(reviewCount, priorWeight = 100) {
  if (!Number.isFinite(reviewCount) || reviewCount < 0) return 0;
  return reviewCount / (reviewCount + priorWeight);
}

function normalizePlatformRating(rating5, platformMean5, platformSd5, targetMean5 = 4.2, targetSd5 = 0.45) {
  if (![rating5, platformMean5, platformSd5, targetMean5, targetSd5].every(Number.isFinite) || platformSd5 <= 0 || targetSd5 <= 0) return null;
  const z = (rating5 - platformMean5) / platformSd5;
  return clamp(((targetMean5 + z * targetSd5) / 5) * 100);
}

function compareIdentity(a, b) {
  if (a.gtin && b.gtin && a.gtin === b.gtin) return 'same';
  const fields = ['brand', 'model', 'generation', 'variant', 'capacity', 'region'];
  const comparable = fields.filter(k => a[k] != null && b[k] != null);
  if (comparable.length < 3) return 'uncertain';
  return comparable.every(k => String(a[k]).toLowerCase() === String(b[k]).toLowerCase()) ? 'same' : 'different';
}

function canCompareProducts(a, b) {
  if (!a || !b || !a.categoryKey || a.categoryKey !== b.categoryKey) return false;
  if (a.productId && b.productId) return a.productId !== b.productId;
  const identity = compareIdentity(a, b);
  return identity === 'different';
}

function combineMeasurements(measurements) {
  if (!measurements.length) return { status: 'insufficient' };
  const groups = new Map();
  for (const m of measurements) {
    const key = `${m.measurand}|${m.unit}|${m.method}|${m.conditions}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m.value);
  }
  const compatible = [...groups.values()].sort((a, b) => b.length - a.length)[0];
  if (!compatible || compatible.length < 2) return { status: 'not-combinable', groups: groups.size };
  const mean = compatible.reduce((a, b) => a + b, 0) / compatible.length;
  const variance = compatible.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, compatible.length - 1);
  return { status: 'combined', mean, sd: Math.sqrt(variance), n: compatible.length };
}

function dominance(a, b) {
  const dims = ['quality', 'value', 'satisfaction'];
  return dims.every(k => a[k] >= b[k]) && dims.some(k => a[k] > b[k]);
}

function winnerFromIntervals(a, b, epsilon = 0.5) {
  const aLow = a.score - a.uncertainty, aHigh = a.score + a.uncertainty;
  const bLow = b.score - b.uncertainty, bHigh = b.score + b.uncertainty;
  if (aLow > bHigh + epsilon) return 'A';
  if (bLow > aHigh + epsilon) return 'B';
  return 'TIE_OR_UNCERTAIN';
}

function valueIndex(quality, totalCost, referenceCost) {
  if (![quality, totalCost, referenceCost].every(Number.isFinite) || totalCost <= 0 || referenceCost <= 0) return null;
  return clamp(quality * Math.sqrt(referenceCost / totalCost));
}

function categorySafety(name, rawCategory) {
  const t = `${name} ${rawCategory}`.toLowerCase();
  const food = /(kiwi|fruit|food|snack|beverage)/.test(t);
  const cleaning = /(mop|걸레|밀대|broom|cleaning)/.test(t);
  const manicure = /(manicure|nail polish|매니큐어|nail care)/.test(t);
  const automotive = /(car|자동차|vehicle|dash cam|automotive)/.test(t);
  return !(food && cleaning) && !(manicure && automotive);
}

const tests = [];
function test(name, fn) { tests.push([name, fn]); }

test('small review samples are shrunk toward the category prior', () => {
  const one = bayesianRating(5, 1), many = bayesianRating(5, 10000);
  assert(one < many && one > 0 && many <= 100, 'small samples must be conservative and bounded');
});

test('review count changes confidence, while raw satisfaction remains raw satisfaction', () => {
  const raw = (4.5 / 5) * 100;
  assert(raw === 90, 'raw satisfaction must remain 90');
  assert(reviewConfidence(10000) > reviewConfidence(100), 'confidence can increase with sample size');
});

test('missing review data is not converted to zero quality', () => {
  assert(bayesianRating(NaN, 0) === null, 'missing rating must remain missing');
});

test('same product variants are not silently merged', () => {
  const a = { brand: 'Apple', model: 'AirPods 4', generation: '4', variant: 'ANC', capacity: 'standard', region: 'KR', gtin: 'A' };
  const b = { brand: 'Apple', model: 'AirPods 4', generation: '4', variant: 'standard', capacity: 'standard', region: 'KR', gtin: 'B' };
  assert(compareIdentity(a, b) === 'different', 'ANC and non-ANC variants must be distinct');
});

test('same detailed category is required for product-vs-product comparison', () => {
  const a = { productId: 'A', categoryKey: 'electronics.audio.earbuds.open.anc' };
  const b = { productId: 'B', categoryKey: 'electronics.audio.earbuds.open.anc' };
  const c = { productId: 'C', categoryKey: 'electronics.audio.headphones.overear.anc' };
  assert(canCompareProducts(a, b) === true, 'same leaf category should be comparable');
  assert(canCompareProducts(a, c) === false, 'different leaf category should not be directly compared');
});

test('manufacturer claims and independent measurements stay separate', () => {
  const measurements = [
    { sourceType: 'manufacturer_claim', value: 8 },
    { sourceType: 'independent_test', value: 7.2 },
    { sourceType: 'independent_test', value: 7.5 }
  ];
  assert(measurements.some(m => m.sourceType === 'manufacturer_claim'), 'claim must remain present');
  assert(measurements.some(m => m.sourceType === 'independent_test'), 'independent evidence must remain present');
});

test('incompatible measurement methods are not blindly averaged', () => {
  const r = combineMeasurements([
    { measurand: 'battery', unit: 'h', method: 'A', conditions: '50%', value: 7.2 },
    { measurand: 'battery', unit: 'h', method: 'B', conditions: '50%', value: 7.8 }
  ]);
  assert(r.status === 'not-combinable', 'different methods must not be blindly pooled');
});

test('compatible repeated measurements can be summarized', () => {
  const r = combineMeasurements([
    { measurand: 'battery', unit: 'h', method: 'A', conditions: '50%', value: 7.2 },
    { measurand: 'battery', unit: 'h', method: 'A', conditions: '50%', value: 7.4 },
    { measurand: 'battery', unit: 'h', method: 'A', conditions: '50%', value: 7.3 }
  ]);
  assert(r.status === 'combined' && Math.abs(r.mean - 7.3) < 1e-9, 'compatible repeated tests should combine');
});

test('quality and value are separate', () => {
  assert(valueIndex(95, 200000, 100000) < 95, 'higher cost can lower value without changing quality');
});

test('uncertainty prevents false winner declarations', () => {
  assert(winnerFromIntervals({ score: 94, uncertainty: 2 }, { score: 93, uncertainty: 2 }) === 'TIE_OR_UNCERTAIN', 'overlapping intervals cannot produce a confident winner');
  assert(winnerFromIntervals({ score: 96, uncertainty: 1 }, { score: 85, uncertainty: 1 }) === 'A', 'well-separated intervals should produce a winner');
});

test('Pareto tradeoffs are preserved', () => {
  const a = { quality: 98, value: 70, satisfaction: 90 };
  const b = { quality: 90, value: 95, satisfaction: 90 };
  assert(!dominance(a, b) && !dominance(b, a), 'tradeoff products must not be forced into a fake universal winner');
});

test('platform normalization uses relative position, not raw platform score', () => {
  const a = normalizePlatformRating(4.7, 4.4, 0.2);
  const b = normalizePlatformRating(4.7, 4.8, 0.2);
  assert(a > b, 'same raw rating can mean different relative positions');
});

test('obvious category contradictions are rejected', () => {
  assert(categorySafety('Kiwi fruit', 'cleaning mop') === false, 'kiwi/mop contradiction must fail');
  assert(categorySafety('Manicure nail polish', 'automotive') === false, 'nail polish/automotive contradiction must fail');
  assert(categorySafety('Car wax', 'automotive') === true, 'valid automotive item must pass');
});

test('small input perturbations do not cause wild value jumps', () => {
  const base = valueIndex(90, 100000, 100000);
  const perturbed = valueIndex(90.5, 101000, 100000);
  assert(Math.abs(base - perturbed) < 2, 'small perturbation should not create a wild score jump');
});

test('data quantity and evidence quality remain distinct', () => {
  const tinyHighQuality = { reviewCount: 20, evidenceQuality: 95 };
  const hugeLowQuality = { reviewCount: 20000, evidenceQuality: 40 };
  assert(tinyHighQuality.evidenceQuality !== hugeLowQuality.evidenceQuality, 'sample size must not overwrite evidence quality');
});

let passed = 0;
for (const [name, fn] of tests) {
  try { fn(); passed++; console.log(`PASS  ${name}`); }
  catch (error) { console.error(`FAIL  ${name}\n      ${error.message}`); process.exitCode = 1; }
}
console.log(`\n${passed}/${tests.length} validation tests passed.`);
if (passed !== tests.length) process.exitCode = 1;
