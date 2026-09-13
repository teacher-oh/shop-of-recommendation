// Deterministic three-part score used by the product UI.
// Scores are 0-100. Missing evidence is neutral/unknown, never zero.
// Total = average(Review, Price, Performance).

function clamp(n, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }

function reviewScore(product, categoryPrior5 = 4.6, priorWeight = 100) {
  const rating = Number(product.rating ?? product.reviewRating ?? product.scores?.review);
  const count = Number(product.ratingCount ?? product.reviewCount ?? product.reviews ?? 0);
  if (!Number.isFinite(rating) || rating <= 0) return null;
  const raw = clamp((rating / 5) * 100);
  const confidence = count / (count + priorWeight);
  const prior = clamp((categoryPrior5 / 5) * 100);
  return clamp(confidence * raw + (1 - confidence) * prior);
}

function priceScore(product, cohort) {
  const price = Number(product.price ?? product.salePrice);
  const prices = (cohort || []).map(p => Number(p.price ?? p.salePrice)).filter(Number.isFinite).filter(v => v > 0);
  if (!Number.isFinite(price) || price <= 0 || prices.length < 2) return null;
  const sorted = [...prices].sort((a,b) => a-b);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (!Number.isFinite(median) || median <= 0) return null;
  // Diminishing-return relative value: cheaper than the cohort median scores higher.
  return clamp(100 * Math.sqrt(median / price));
}

function performanceScore(product) {
  const explicit = Number(product.performanceScore ?? product.scores?.performance ?? product.performance);
  if (Number.isFinite(explicit)) return clamp(explicit);
  // No measurement/spec evidence means unknown, not zero.
  return null;
}

function totalScore(product, cohort = []) {
  const parts = [reviewScore(product), priceScore(product, cohort), performanceScore(product)].filter(Number.isFinite);
  if (!parts.length) return null;
  // User-facing total uses the average of the available components, while the UI
  // separately reports evidence coverage so missing performance cannot masquerade as poor performance.
  return Math.round((parts.reduce((a,b) => a+b, 0) / parts.length) * 10) / 10;
}

function scoreProduct(product, cohort = []) {
  const review = reviewScore(product);
  const price = priceScore(product, cohort);
  const performance = performanceScore(product);
  const total = totalScore(product, cohort);
  const available = [review, price, performance].filter(Number.isFinite).length;
  return {
    review: Number.isFinite(review) ? Math.round(review * 10) / 10 : null,
    price: Number.isFinite(price) ? Math.round(price * 10) / 10 : null,
    performance: Number.isFinite(performance) ? Math.round(performance * 10) / 10 : null,
    total,
    evidenceCoverage: `${available}/3`
  };
}

module.exports = { clamp, reviewScore, priceScore, performanceScore, totalScore, scoreProduct };
