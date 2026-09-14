// Central provider registry.
// Providers are optional and fail closed: one unavailable source must not prevent other sources.
// Synthetic/demo sources are tagged and should never be treated as real-world evidence.

const ebay = require('./adapters/ebay');
const dummyjson = require('./adapters/dummyjson');
const fakestore = require('./adapters/fakestore');
const openlibrary = require('./adapters/openlibrary');
const googlebooks = require('./adapters/googlebooks');
const upcitemdb = require('./adapters/upcitemdb');
const openfacts = require('./adapters/openfacts');

const providers = {
  ebay: {
    name: 'eBay Browse API', capabilities: ['search', 'offers', 'seller'], run: ebay.run, kind: 'marketplace', requiresAuth: true
  },
  dummyjson: {
    name: 'DummyJSON', capabilities: ['search', 'catalog'], run: dummyjson.run, kind: 'synthetic', requiresAuth: false
  },
  fakestore: {
    name: 'Fake Store API', capabilities: ['search', 'catalog', 'ratings'], run: fakestore.run, kind: 'synthetic', requiresAuth: false
  },
  openlibrary: {
    name: 'Open Library', capabilities: ['book-search', 'ratings', 'identifiers'], run: openlibrary.run, kind: 'public-catalog', requiresAuth: false
  },
  googlebooks: {
    name: 'Google Books', capabilities: ['book-search', 'ratings', 'identifiers', 'offers'], run: googlebooks.run, kind: 'public-catalog', requiresAuth: true
  },
  upcitemdb: {
    name: 'UPCitemdb Free Trial', capabilities: ['barcode-lookup', 'identifiers', 'offers'], run: upcitemdb.run, kind: 'public-catalog', requiresAuth: false, rateLimited: true
  },
  openfacts: {
    name: 'Open Food/Beauty/Pet/Products Facts', capabilities: ['food', 'beauty', 'pet', 'barcode', 'catalog'], run: openfacts.run, kind: 'open-data', requiresAuth: false
  }
};

function enabledProviderNames() {
  return Object.keys(providers).filter(name => !providers[name].requiresAuth);
}

async function searchAll({ query, providers: requested = enabledProviderNames(), limit = 20 } = {}) {
  const selected = requested.filter(name => providers[name] && !providers[name].requiresAuth);
  const results = await Promise.allSettled(selected.map(name => providers[name].run({ query, limit })));
  return results.flatMap((result, index) => {
    const provider = selected[index];
    if (result.status === 'fulfilled') return result.value;
    console.warn(`[provider:${provider}] unavailable: ${result.reason?.message || result.reason}`);
    return [];
  });
}

module.exports = { providers, enabledProviderNames, searchAll };
