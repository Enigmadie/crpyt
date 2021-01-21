import querystring from 'querystring';

const host = 'https://api.changenow.io';
const prefix = 'v1';
const apiKey = 'c9155859d90d239f909d2906233816b26cd8cf5ede44702d422667672b58b0cd';

export default {
  listCurrenciesApiPath: (query) => [host, prefix, 'currencies', `?${querystring.stringify(query)}`].join('/'),
  minimalExchangeAmountApiPath: (fromTo) => [host, prefix, 'min-amount', fromTo, `?api_key=${apiKey}`].join('/'),
  estimatedExchangeAmountApiPath: (amount, fromTo) => [host, prefix, 'exchange-amount', amount, fromTo, `?api_key=${apiKey}`].join('/'),
};
