import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'

Meteor.methods({
  'projectionStats': (time, name) => {
    const days = InsightsBreakdownsByDays.find({'data.initiative': name}).fetch();
    let cleanedArr = [];
    days.forEach(el => {
      el.data.spend = accounting.unformat(el.data.spend);
      // el.data.date_start = moment(el.data.date_start, "MM-DD-YYYY").toISOString();
      el.data.impressions = parseInt(el.data.impressions); // string to integer
      !el.data.like ? el.data.like = 0 : '';
      let obj = {};
      obj = _.pick(el.data, 'date_start', 'impressions', 'spend', 'total_actions', 'like', 'clicks'); // pick out key/values we want
      cleanedArr.push(obj);
    });
    cleanedArr = _.sortBy(cleanedArr, 'date_start')

    const getAverages = function getAverages(days, arr) {
      let pastDate;
      if (days === "Lifetime") {
        pastDate = moment("1-1-2003", "MM-DD-YYYY");
      } else {
        pastDate = moment().subtract(days, "days");
      }

      const targetDates = [];
      arr.forEach(el => {
        if (moment(el.date_start).isAfter(pastDate)) {
          targetDates.push(el);
        }
      });

      let finalObj = {};

      var impressions = targetDates.reduce(function(a,b) {
        return {impressions: a.impressions + b.impressions}
      });
      finalObj['impressions'] = impressions.impressions / targetDates.length

      var spend = targetDates.reduce(function(a,b) {
        return {spend: a.spend + b.spend}
      });
      finalObj['spend'] = spend.spend / targetDates.length

      var total_actions = targetDates.reduce(function(a,b) {
        return {total_actions: a.total_actions + b.total_actions}
      });
      finalObj['total_actions'] = total_actions.total_actions / targetDates.length

      var like = targetDates.reduce(function(a,b) {
        return {like: a.like + b.like}
      });
      finalObj['like'] = like.like / targetDates.length

      var clicks = targetDates.reduce(function(a,b) {
        return {clicks: a.clicks + b.clicks}
      });
      finalObj['clicks'] = clicks.clicks / targetDates.length

      return finalObj;

    } // end of function

    try {
      return getAverages(time, cleanedArr);
    } catch(e) {
      return {
        impressions: "No Data",
        spend: "No Data",
        total_actions: "No Data",
        like: "No Data",
        clicks: "No Data",
      }
    }
  }
});
