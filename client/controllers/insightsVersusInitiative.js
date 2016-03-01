Template.reporter.helpers({
    'reporting': function () {
        let campId = Session.get("campaign_id");
        console.log('from session.get campId', campId);
        let insights = CampaignInsights.findOne({'data.campaign_id': campId});
        let initiative = Initiatives.findOne({campaign_id: campId});
        let dailyInsights = InsightsBreakdownsByDays.find({'data.campaign_id': campId}).fetch();
        let dailyClicksArray = [];
        let masterArray = [];

        let start = moment(insights.data.date_start);
        let stop = moment(insights.data.date_stop);
        let duration = stop.diff(start, 'days') + 1
        console.log('duration:', duration)

        // evenly distributed clicks / day for IO
        let evenIoClicks = initiative.quantity / duration;
        console.log("evenly distributed daily clicks based on IO numbers:", evenIoClicks);

        //real distribution of clicks / day
        dailyInsights.forEach(el => {
            dailyClicksArray.push(el.data.clicks);
        });
        console.log(dailyClicksArray);

        // compare IO clicks ordered to real clicks
        // view day by day clicks versus evenIoClicks
        // array of objects may be best bet here
        // need to make each day have a total num of clicks
        let total = 0;
        dailyClicksArray.forEach((el, index) => {
            let obj = {};
            obj['day'] = index + 1;
            obj['dailyClicks'] = el;
            obj['ioClicks'] = evenIoClicks;
            obj['ioTotal'] = (index + 1) * evenIoClicks;
            obj['clickTotal'] = total + el;
            obj['dailyClickDiff'] = obj.dailyClicks - obj.ioClicks;
            obj['totalClickDiff'] = obj.clickTotal - obj.ioTotal;
            total += el;

            masterArray.push(obj);
        })
        console.log(masterArray);

        return masterArray;
    },
    'colorIndicator': function (num) {

    }
})
