// Load lib.
const harvest = require('./lib/harvest');
const argv = require('minimist')(process.argv.slice(2));
const validator = require('validator');
// Use moment for weekday calculations. TODO: Probably need to replace this for something better later on.
moment = require('moment');
require('moment-weekday-calc');

// SETUP - see .env_example and copy it to a .env file.
const user_id = process.env.HARVEST_USER_ID;
let date_from = process.env.HARVEST_DATE_FROM ? process.env.HARVEST_DATE_FROM : new Date().getFullYear() + '-01-01';
let date_to = process.env.HARVEST_DATE_TO ? process.env.HARVEST_DATE_TO : new Date().toISOString().split('T')[0];
const unpaidHours = parseInt(process.env.HARVEST_UNPAID ? process.env.HARVEST_UNPAID : 0);
const overtime_hours_from_last_year = parseInt(process.env.HARVEST_OVERTIME_LAST_YEAR ? process.env.HARVEST_OVERTIME_LAST_YEAR : 0);
const paid_overtime_hours = parseInt(process.env.HARVEST_PAID_OVERTIME ? process.env.HARVEST_PAID_OVERTIME : 0);
const dayLength = parseFloat(process.env.HARVEST_DAY_LENGTH ? process.env.HARVEST_DAY_LENGTH : 7.5);

// Check for from/to dates if user passed arguments.
if (Object.keys(argv).length > 1) {
  date_from = (argv['from']) ? getValidDate(argv['from']) : date_from;
  date_to = (argv['to']) ? getValidDate(argv['to']) : date_to;
  if (!date_from || !date_to) {
    return false;
  }
}

async function main() {
  try {
    // Mon-Fri.
    const totalWorkdays = moment().isoWeekdayCalc(date_from, date_to, [
      1,
      2,
      3,
      4,
      5
    ]);
    console.log('(calculating worktime balance...)');
    console.log('TIMEFRAME'+'\n'+`Period: ${date_from} - ${date_to}`);
    console.log('\n'+'STATISTICS')
    // Output how many weekdays on period.
    console.log('Weekdays (Mon-Fri) so far for given period: ' + totalWorkdays);

    const shouldBe = totalWorkdays * dayLength;
    // Show many hours there should be during the period. PS: Pay attention that if you balanced hours from previous year, this is off.
    // Thus it's recommended to update balance from last year as negative or positive to "overtime hours from last year" above.
    console.log('Hours needed: ' + shouldBe);
    // Let's take into account balance. This show the actual hours needed taken balance into account.
    console.log(
      'Hours needed, period start balance taken into account: ' +
        (shouldBe - overtime_hours_from_last_year)
    );

    // Get user entries from Harvest for the period.
    const entries = await harvest.getUserEntries(user_id, date_from, date_to);
    // Calculate how many hours has been done.
    const total = entries.reduce((sum, dayEntry) => sum + dayEntry.hours, 0);
    // Set total.
    const total_adjusted = total;
    // Show many hours there has been marked to Harvest.
    console.log('Total hours marked in Harvest: ' + total_adjusted);
    // Show how many hours has been marked as balance from last year.
    console.log(
      `Last year under- or overtime hours transferred to quota: ${overtime_hours_from_last_year}`
    );
    // Has there been any paid overtime? If so show this, but this is deducted from overtime as it's paid.
    console.log(
      `Paid overtime hours: ${paid_overtime_hours}`
    );
    // Has there been any unpaid overtime? Show this but this should be added to balance as it's unpaid and agreed balance.
    console.log(
      `Unpaid absence hours: ${unpaidHours}`
    );

    // Calculate balance.
    const diff =
      total_adjusted - shouldBe - paid_overtime_hours + overtime_hours_from_last_year + unpaidHours;
    const diffWithoutBalance =
      diff - overtime_hours_from_last_year;
    // Show balance in hrs.
    console.log('\n'+'TOTAL BALANCE');
    console.log('Diff (h): ' + diff.toFixed(2));
    // Show balance in days.
    console.log('Diff (days): ' + (diff.toFixed(2)/dayLength));
    // Show balance without previous year(s).
    console.log('\n'+'TOTAL BALANCE FOR CURRENT YEAR ONLY (No previous balances)');
    console.log('Diff (h): ' + diffWithoutBalance.toFixed(2));
    // Show balance in days.
    console.log('Diff (days): ' + (diffWithoutBalance.toFixed(2)/dayLength));
  } catch (e) {
    console.error(e);
  }
}

main();


function getValidDate(dateStr) {
  if (validator.isDate(dateStr)) {
    return dateStr;
  }
  else {
    console.log('Invalid date input "' + dateStr + '"');
    return false
  }
}