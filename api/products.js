const { runProviders } = require('./providers');

module.exports = async function handler(req, res) {
  try {
    const products = await runProviders();
    const unique = [...new Map(products.map(p => [p.id, p])).values()];
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.status(200).json({
      live: unique.length > 0,
      updatedAt: new Date().toISOString(),
      count: unique.length,
      products: unique
    });
  } catch (error) {
    res.status(502).json({ live: false, error: '상품 API 연결 실패', products: [] });
  }
};
