// Load lib.
const harvest = require('./lib/harvest');
// Use moment for weekday calculations. TODO: Probably need to replace this for something better later on.
moment = require('moment');
require('moment-weekday-calc');

// SETUP - Enter your information in this section.
// Add here you Harvest ID. You can find it from Harvest, My profile, see url for ID).
const user_id = 123456;
// Add here your local workday length.
const dayLength = 7.5;
// Start date, usually first of the year.
const start_date = '2021-01-01';
// End date. To what date calculate hourly balance.
const end_date = '2021-10-27';
// Mark here if you have spent unpaid hours. Those should not get deducted from balance as they're not paid.
const unpaidHours = 0;

// You can mark if you have balance from previous year(s) to be transferred here. It will be taken into account in calculation.
// However if you want to see your current year's balance. Have this as 0.
const overtime_hours_from_last_year = 99.47;

// If you have been paid for extra hours. Those should not be included as those don't belong "twice" to your total. Mark them here.
const paid_overtime_hours = 0;
// SETUP ENDS.

async function main() {
  try {
    // Mon-Fri.
    const totalWorkdays = moment().isoWeekdayCalc(start_date, end_date, [
      1,
      2,
      3,
      4,
      5
    ]);
    console.log('(calculating worktime balance...)');
    console.log('TIMEFRAME'+'\n'+`Period: ${start_date} - ${end_date}`);
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
    const entries = await harvest.getUserEntries(user_id, start_date, end_date);
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
  return;
}

main();
