import { CronJob } from 'cron';
import { updateItems } from '../scripts/updateItems';
import { updateExchangeRates } from '../scripts/updateExchangeRates';

export async function cronInitializer() {
  await updateItems();
  await updateExchangeRates();

  // https://www.npmjs.com/package/cron#api
  const updateItemsJob = new CronJob('10 0 0 * * *', updateItems, null, true, 'UTC');

  // https://www.nbp.pl/home.aspx?f=/kursy/instrukcja_pobierania_kursow_walut.html
  // Exchange rates are updated daily between 11:45 and 12:15
  const updateExchangeRatesJob = new CronJob('10 15 12 * * *', updateExchangeRates, null, true);
}
