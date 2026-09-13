// Review text must come from a provider/API that permits reuse.
// We do not copy entire third-party reviews into the site. We keep source attribution
// and generate short, original summaries from structured review signals.

function summarize(reviews = []) {
  const rows = reviews.filter(r => r && (r.text || r.title || r.rating != null));
  const ratings = rows.map(r => Number(r.rating)).filter(Number.isFinite);
  const avg = ratings.length ? Math.round((ratings.reduce((a,b)=>a+b,0) / ratings.length) * 10) / 10 : null;
  const positive = rows.filter(r => Number(r.rating) >= 4).length;
  const negative = rows.filter(r => Number(r.rating) <= 2).length;
  return {
    reviewCount: rows.length,
    averageRating: avg,
    positiveShare: rows.length ? Math.round(positive / rows.length * 100) : null,
    negativeShare: rows.length ? Math.round(negative / rows.length * 100) : null,
    summary: avg == null ? '검증된 리뷰 데이터가 아직 없습니다.' : `제공된 ${rows.length}개 리뷰에서 평균 ${avg}/5점으로 확인되었습니다. 긍정 의견 ${positive}개, 부정 의견 ${negative}개가 집계되었습니다.`
  };
}

module.exports = async function handler(req, res) {
  const reviews = Array.isArray(req.body?.reviews) ? req.body.reviews : [];
  res.status(200).json(summarize(reviews));
};
