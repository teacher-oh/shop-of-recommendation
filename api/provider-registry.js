// Central provider registry. Providers are optional and fail closed: one unavailable source
// must not prevent other sources from returning data.

const ebay = require('./adapters/ebay');

const providers = {
  ebay: {
    name: 'eBay Browse API',
    capabilities: ['search', 'offers', 'seller'],
    run: ebay.run
  }
};

function enabledProviderNames() {
  return Object.keys(providers).filter(name => {
    if (name === 'ebay') return Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
    return false;
  });
}

async function searchAll({ query, providers: requested = enabledProviderNames(), limit = 20 } = {}) {
  const selected = requested.filter(name => providers[name]);
  const results = await Promise.allSettled(selected.map(name => providers[name].run({ query, limit })));
  return results.flatMap((result, index) => {
    const provider = selected[index];
    if (result.status === 'fulfilled') return result.value;
    console.warn(`[provider:${provider}] unavailable: ${result.reason?.message || result.reason}`);
    return [];
  });
}

module.exports = { providers, enabledProviderNames, searchAll };
