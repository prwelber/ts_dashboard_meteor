Template.reporter.events({

})

Template.reporter.helpers({
    'dealType': function () {
        let campaignId = Session.get("campaign_id");
        let initiative = Initiatives.findOne({campaign_id: campaignId});
        return initiative.dealType
    },
    'reporting': function () {
        // get all the data I need
        let campId = Session.get("campaign_id");
        let insights = CampaignInsights.findOne({'data.campaign_id': campId});
        let initiative = Initiatives.findOne({campaign_id: campId});
        let dailyInsights = InsightsBreakdownsByDays.find({'data.campaign_id': campId}).fetch();
        // use moment to get timing
        let start = moment(insights.data.date_start);
        let stop = moment(insights.data.date_stop);
        let duration = stop.diff(start, 'days') + 1
        // console.log(start, stop, duration)

        // evenly distributed clicks / day for IO
        let evenIoClicks = Math.round(initiative.quantity / duration);
        let dealType = initiative.dealType;

        // split into two different paths
        // One for CPC and one for CPM
        if (dealType == "CPC") {
            let dailyClicksArray = [];
            let masterClicksArray = [];

            //real distribution of clicks / day
            dailyInsights.forEach(el => {
                dailyClicksArray.push(el.data.clicks);
            });
            console.log('daily clicks array', dailyClicksArray)
            let total = 0;
            dailyClicksArray.forEach((el, index) => {
                let obj = {};
                obj['dealType'] = dealType;
                obj['day'] = index + 1;
                obj['dailyClicks'] = el;
                obj['ioClicks'] = evenIoClicks;
                obj['ioTotal'] = (index + 1) * evenIoClicks;
                obj['clickTotal'] = total + el;
                obj['dailyClickDiff'] = obj.dailyClicks - obj.ioClicks;
                obj['totalClickDiff'] = obj.clickTotal - obj.ioTotal;
                obj['dailyClass'] = obj.dailyClickDiff > 0 ? "green" : "red";
                obj['totalClass'] = obj.totalClickDiff > 0 ? "green" : "red";
                total += el;
                masterClicksArray.push(obj);
            })
            return {clicks: masterClicksArray};
        } else if (dealType == "CPM") {
            let dailyImpressionsArray = [];
            let masterImpressionsArray = [];

            dailyInsights.forEach(el => {
                dailyImpressionsArray.push([parseInt(el.data.impressions), el.data.cpm]);
            });
            console.log('dailyImpressionsArray', dailyImpressionsArray);
            let total = 0;
            dailyImpressionsArray.forEach((el, index) => {
                let obj = {};
                obj['dealType'] = dealType;
                obj['day'] = index + 1;
                obj['dailyImpressions'] = el[0];
                obj['ioImpressions'] = evenIoClicks;
                obj['ioTotal'] = (index + 1) * evenIoClicks;
                obj['impressionTotal'] = total + el[0];
                obj['dailyImpressionDiff'] = obj.dailyImpressions - obj.ioImpressions;
                obj['totalImpressionDiff'] = obj.impressionTotal - obj.ioTotal;
                obj['dailyClass'] = obj.dailyImpressionDiff > 0 ? "green" : "red"
                obj['totalClass'] = obj.totalImpressionDiff > 0 ? "green" : "red"
                obj['dailyCPM'] = el[1];
                total += el[0];
                masterImpressionsArray.push(obj);
            });
            //console.log(masterImpressionsArray);
            return {impressions: masterImpressionsArray};
        }

        // compare IO clicks ordered to real clicks
        // view day by day clicks versus evenIoClicks
        // array of objects may be best bet here
        // need to make each day have a total num of clicks
    }
});

Template.campaignInsights.onDestroyed(function () {
    Blaze.remove(reporter);
});
