import * as got from 'got';
import { getRepository } from 'typeorm';
import { ExchangeRate } from '../entities/ExchangeRate';

export async function updateExchangeRates() {
  const apiResponse = await got(process.env.EXCHANGE_RATES_API, { json: true });
  const [{ rates: exchangeRates }] = apiResponse.body;

  const rates = exchangeRates.filter(exchangeRate => ['USD', 'EUR'].includes(exchangeRate.code));

  const exchangeRateRepository = getRepository(ExchangeRate);
  const existingExchangeRates = await exchangeRateRepository.find();
  const existingExchangeRatesCurrencies = existingExchangeRates.map(exchangeRate => exchangeRate.currency);

  for (const rate of rates) {
    if (existingExchangeRatesCurrencies.includes(rate.code)) await exchangeRateRepository.update({ currency: rate.code }, { rate: rate.mid });
    else await exchangeRateRepository.save({ currency: rate.code, rate: rate.mid });
  }
}
