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
          attachments['description'] = attachment.data.attachments.data[0].description;
          attachments['url'] = attachment.data.attachments.data[0].target.url;
          attachments['picture'] = attachment.data.attachments.data[0].media.image.src;
          attachments['title'] = attachment.data.attachments.data[0].title;
          el['attachments'] = attachments;
          delete el.adcreatives;
          otherArray.push(el)
        });
        // console.log(otherArray)
        // console.log(otherArray.length)

        otherArray.forEach(el => {
          data = {};
          for (let key in el) {
              if (key === "insights") {
                  // console.log(el[key]);
                  el[key].data.forEach(el => {
                      for (let k in el) {
                          if (k === "actions") {
                              el[k].forEach(el => {
                                  // this check looks for a period in the key name and
                                  // replaces it with an underscore if found
                                if (/\W/g.test(el.action_type)) {
                                  el.action_type = el.action_type.replace(/\W/g, "_");
                                  data[el.action_type] = el.value;
                                }
                                  data[el.action_type] = el.value;
                              });
                            } else if (k === "cost_per_action_type") {
                              el[k].forEach(el => {
                                 if (/\W/g.test(el.action_type)) {
                                     el.action_type = el.action_type.replace(/\W/g, "_");
                                     data["cost_per_"+el.action_type] = el.value;
                                  } else {
                                     data["cost_per_"+el.action_type] = el.value;
                                 }
                             });
                         } else if (k === "website_ctr") {
                             el[k].forEach(el => {
                                 data[el.action_type+"_ctr"] = el.value;
                             });
                         } else {
                            if (/\W/g.test(k)) {
                                  k = k.replace(/\W/g, "_");
                                 data[k] = el[k];
                            } else {
                                 data[k] = el[k]
                             }
                         }
                      }
                  });
              }
            }
          data['name'] = el.name;
          data['description'] = el.attachments.description;
          data['url'] = el.attachments.url;
          data['picture'] = el.attachments.picture;
          data['title'] = el.attachments.title;
          data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
          delete data['unique_actions'];
          delete data['cost_per_unique_action_type'];
          masterArray.push(data);
        });
        // console.log(data);
        console.log(masterArray);

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
