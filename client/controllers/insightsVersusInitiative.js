Template.reporter.helpers({
    'getReport': function () {
        let campId = Session.get("campaign_id");
        console.log('from session.get campId', campId);
        let insights = CampaignInsights.findOne({'data.campaign_id': campId});
        let initiative = Initiatives.findOne({campaign_id: campId});
        let dailyInsights = InsightsBreakdownsByDays.find({'data.campaign_id': campId}).fetch();
        let dailyClicksArray = [];

        let start = moment(insights.data.date_start);
        let stop = moment(insights.data.date_stop);
        let duration = stop.diff(start, 'days') + 1
        console.log('duration:', duration)

        // evenly distrubuted clicks / day
        let evenClicks = insights.data.clicks / duration;
        console.log(Math.round(evenClicks));

        // evenly distributed clicks / day for IO
        let evenIoClicks = initiative.quantity / duration;
        console.log(evenIoClicks);

        //real distribution of clicks / day
        dailyInsights.forEach(el => {
            dailyClicksArray.push(el.data.clicks);
        });
        console.log(dailyClicksArray);



    }
})
