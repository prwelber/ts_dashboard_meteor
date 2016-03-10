Meteor.methods({
    'removeAds': function () {
        console.log('removing Ads collection');
        Ads.remove( {} );
    }
});

Meteor.methods({
    'getAds': function (accountNumber, campaignMongoId, campaignName) {
        let adsArray = [];
        let otherArray = [];
        let masterArray = [];
        let ads;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/ads?fields=adcreatives{object_story_id},insights,account_id,adset_id,campaign_id,name,id&limit=75&access_token='+token+'', {});
            ads = result;
            // ads variable is now an array of objects
            adsArray.push(ads.data.data);

            adsArray = _.flatten(adsArray);
            adsArray.forEach(el => {
                let attachments = {}
                let attachment = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+el.adcreatives.data[0].object_story_id+'?fields=attachments,message&access_token='+token+'', {});
                // console.log(attachment.data.attachments.data[0])
                // console.log("description", attachment.data.attachments.data[0].description)
                attachments['description'] = attachment.data.attachments.data[0].description;
                // console.log("target url", attachment.data.attachments.data[0].target.url) // target url
                attachments['url'] = attachment.data.attachments.data[0].target.url;
                // console.log("src picture", attachment.data.attachments.data[0].media.image.src) // src picture
                attachments['picture'] = attachment.data.attachments.data[0].media.image.src;
                // console.log("title", attachment.data.attachments.data[0].title)
                attachments['title'] = attachment.data.attachments.data[0].title;
                el['attachments'] = attachments;
                delete el.adcreatives;
                otherArray.push(el)
            });
            // console.log(otherArray)
            // console.log(otherArray.length)

            otherArray.forEach(el => {
                let data = {};
                for (let key in el) {
                    if (key === "insights") {
                        console.log(el[key]);
                    }
                }
            });







            // otherArray.forEach(el => {
            //     let data = {};
            //     for (let key in el) {
            //         if (key == "actions") {
            //             el[key].forEach(el => {
            //                 // this check looks for a period in the key name and
            //                 // replaces it with an underscore if found
            //                 // this check is used two more times below
            //                 if (/\W/g.test(el.action_type)) {
            //                     // console.log("before key", el.action_type)
            //                     el.action_type = el.action_type.replace(/\W/g, "_");
            //                     // console.log("after key", el.action_type)
            //                     data[el.action_type] = el.value;
            //                 }
            //                 data[el.action_type] = el.value;
            //             });
            //         } else if (key == "cost_per_action_type") {
            //              el[key].forEach(el => {
            //                 if (/\W/g.test(el.action_type)) {
            //                     el.action_type = el.action_type.replace(/\W/g, "_");
            //                     data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
            //                 } else {
            //                     data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
            //                 }
            //             });
            //         } else {
            //             // this check looks for a period in the key name and
            //             // replaces it with an underscore
            //             if (/\W/g.test(key)) {
            //                 key = key.replace(/\W/g, "_");
            //                 data[key] = el[key];
            //             } else {
            //                 data[key] = el[key]
            //             }
            //         }
            //     }
            // });





                masterArray.push(data);
            // console.log(masterArray);






            // while (true) {
            //     try {
            //         ads = HTTP.call('GET', ads.data.paging['next'], {});
            //         adsArray.push(ads.data.data)
            //     } catch(e) {
            //         console.log('no more pages or error in while true loop', e);
            //         break;
            //     }
            // }

        } catch(e) {
            console.log('Error pulling Ads data', e);
        }

    }
});

Meteor.publish('AdsList', function () {
    return Ads.find( {} );
})
