Meteor.methods({
    'removeAdsCollection': function () {
        console.log('removing Ads collection');
        Ads.remove( {} );
    }
});

Meteor.methods({
    'getAds': function (accountNumber, campaignMongoId, campaignName) {
        let adsArray = [];
        let masterArray = [];
        let ads;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/ads?fields=insights{cpm,cpp,ctr,impressions,reach,spend,actions,cost_per_action_type},adcreatives{id,image_url,name,body,thumbnail_url,title,link_url,product_set_id},name,id,account_id,adset_id,campaign_id,created_time&access_token='+token+'', {});
            ads = result;
            // ads variable is now an array of objects
            adsArray.push(ads.data.data);

            while (true) {
                try {
                    ads = HTTP.call('GET', ads.data.paging['next'], {});
                    adsArray.push(ads.data.data)
                } catch(e) {
                    console.log('no more pages or error in while true loop', e);
                    break;
                }
            }

            // flatten array
            adsArray = _.flatten(adsArray);

            // console.log(adsArray);

            adsArray.forEach(el => {
                let data = {};
                data['name'] = el.name;
                data['id'] = el.id;
                data['account_id'] = el.account_id;
                data['adset_id'] = el.adset_id;
                data['campaign_id'] = el.campaign_id;
                data['created_time'] = moment(el.created_time).format("MM-DD-YYYY hh:mm a");
                try {
                    el.insights.data.forEach(el => {
                        data['spend'] = accounting.formatMoney(el.spend, "$", 2);
                        data['cpm'] = accounting.formatMoney(el.cpm, "$", 2);
                        data['cpp'] = accounting.formatMoney(el.cpp, "$", 2);
                        data['ctr'] = el.ctr;
                        data['impressions'] = el.impressions;
                        data['reach'] = el.reach;
                        data['clicks'] = Math.round((el.ctr / 100) * el.impressions);
                        el.actions.forEach(el => {
                            data[el.action_type] = el.value;
                        });
                        el.cost_per_action_type.forEach(el => {
                            data['cost_per_'+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                        });
                    });
                } catch(e) {
                    console.log("Error while looping over and organizing data", e);
                }
                try {
                    el.adcreatives.data.forEach(el => {
                        data['ad_creative_id'] = el.id;
                        data['image_url'] = el.image_url;
                        data['ad_creative_name'] = el.name;
                        data['body'] = el.body;
                        data['thumbnail_url'] = el.thumbnail_url;
                        data['title'] = el.title;
                    })
                } catch(e) {
                    console.log("Error while looping over and organizing data", e);
                }
                data['campaign_mongo_reference'] = campaignMongoId;
                data['campaign_name'] = campaignName;
                masterArray.push(data);
            });
        } catch(e) {
            console.log('Error pulling Ads data', e);
        }
        try {
            masterArray.forEach(el => {
                Ads.insert({
                    inserted: moment().format('MM-DD-YYYY hh:mm a'),
                    name: el.name,
                    id: el.id,
                    account_id: el.account_id,
                    adset_id: el.adset_id,
                    campaign_id: el.campaign_id,
                    created_time: el.created_time,
                    spend: el.spend,
                    ctr: el.ctr,
                    cpm: el.cpm,
                    cpp: el.cpp,
                    impressions: el.impressions,
                    reach: el.reach,
                    like: el.like,
                    link_click: el.link_click,
                    offsite_conversion_registration: el['offsite_conversion.registration'],
                    page_engagement: el.page_engagement,
                    post_engagement: el.post_engagement,
                    offsite_conversion: el.offsite_conversion,
                    cost_per_like: el.cost_per_like,
                    cost_per_link_click: el.cost_per_link_click,
                    cost_per_offsite_conversion_registration: el['cost_per_offsite_conversion.registration'],
                    cost_per_page_engagement: el.cost_per_page_engagement,
                    cost_per_post_engagement: el.cost_per_post_engagement,
                    cost_per_offsite_conversion: el.cost_per_offsite_conversion,
                    ad_creative_id: el.ad_creative_id,
                    image_url: el.image_url,
                    ad_creative_name: el.ad_creative_name,
                    body: el.body,
                    thumbnail_url: el.thumbnail_url,
                    title: el.title,
                    campaign_mongo_reference: el.campaign_mongo_reference,
                    campaign_name: el.campaign_name
                });
            });
        } catch(e) {
            console.log('Error inserting into DB', e);
        }
    }
});

Meteor.publish('AdsList', function () {
    return Ads.find( {} );
})
