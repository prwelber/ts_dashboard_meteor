import Ads from '/collections/Ads'
import { apiVersion } from '/server/token/token';
const token = require('/server/token/token.js');

Meteor.methods({
  'removeAds': function () {
      console.log('removing Ads collection');
      Ads.remove( {} );
  }
});



Meteor.methods({
  refreshAds: (campaignId) => {
    Ads.remove({'data.campaign_id': campaignId});
  },
  'getAds': function (accountNumber) {
    let adsArray = [];
    let otherArray = [];
    let masterArray = [];
    let carouselArray = [];
    let ads;
    const query = '/ads?fields=adcreatives{object_story_id,image_url,object_id,body,title,template_url,name,thumbnail_url,url_tags,link_url},insights{clicks,actions,cost_per_action_type,total_actions,spend,objective,cpc,cpp,cpm,ctr,impressions,frequency,reach},campaign_id,name,keywordstats,id&date_preset=lifetime&limit=75&access_token='
    try {
        let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+accountNumber+query+token.token+'', {});
        ads = result;
        // ads variable is now an array of objects
        adsArray.push(ads.data.data);
        adsArray = _.flatten(adsArray);
        adsArray.forEach(el => { // pulls in creative attachments (picture, url, message)
          let attachments = {}

          if (! el.adcreatives.data[0].object_story_id) { // if there is no object story id

            let obj = el.adcreatives.data[0] // for readability and concision
            attachments['message'] = obj.body;
            attachments['url'] = obj.image_url;
            el['attachments'] = attachments;
            delete el.adcreatives;
            otherArray.push(el)

          } else { // if there is object story id, make the 2nd api call to get more details

            // make 2nd api call with object_story_id to retrieve attachments
            let attachment = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+el.adcreatives.data[0].object_story_id+'?fields=child_attachments,attachments,message&access_token='+token.token+'', {});
            // determine if carousel ad
            if (attachment.data.child_attachments && attachment.data.attachments.data[0].hasOwnProperty('subattachments')) {
              attachment.data.child_attachments.forEach(element => {
                let carouselAttachments = {};
                carouselAttachments['id'] = element.id;
                carouselAttachments['picture'] = element.picture;
                carouselAttachments['name'] = element.name;
                carouselAttachments['link'] = element.link;
                carouselAttachments['description'] = element.description;
                delete el.adcreatives;
                carouselArray.push(carouselAttachments);
              });
              el['carouselData'] = carouselArray;
              otherArray.push(el)

              // now make another call for individual carousel stats and we will
              // add it to the appropriate ID
              let carouselNumbers = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+accountNumber+'/insights?fields=impressions,inline_link_clicks,actions,website_ctr&action_breakdowns=["action_type","action_carousel_card_id"]&date_preset=lifetime&access_token='+token.token+'', {});

              let numbers = carouselNumbers.data.data[0];
              /*
              in the section that follows, there are two if statements that
              compare ID's in the existing carousel data with ID's in the newly
              pulled in data on individual carousel media. This series of
              actions will only run if the if statement on line 28 is true and
              a carousel ad is detected
              */

              for (let key in numbers) {

                if (key === "actions") {
                  // console.log(otherArray)
                  numbers[key].forEach(element => {
                    // here i want to start a loop over the carouselData
                    // and look for matching ID's
                    // console.log(otherArray[0]);
                    try {
                      otherArray.forEach(carousel => {
                      if (carousel.carouselData) {
                        carousel.carouselData.forEach(car => {
                          if (car.id === element.action_carousel_card_id) {
                            car['link_click'] = element.value;
                            car['action_carousel_card_id'] = element.action_carousel_card_id;
                          }
                        });
                      }
                    });
                    } catch(e) {
                      console.log("Error with ID matching:", e);
                    }
                  });
                }

                if (key === "website_ctr") {
                  numbers[key].forEach(element => {
                    // here i want to start a loop over the carouselData
                    // and look for matching ID's
                    try {
                      otherArray.forEach(carousel => {
                        if (carousel.carouselData) {
                          carousel.carouselData.forEach(car => {
                            if (car.id === element.action_carousel_card_id) {
                              car['link_ctr'] = element.value;
                              car['action_carousel_card_id'] = element.action_carousel_card_id;
                            }
                          });
                        }
                      });
                    } catch(e) {
                      console.log("Error with ID matching:", e);
                    }
                  });
                }
              } // end of for key in numbers loop

            } else {
              let obj = attachment.data.attachments.data[0];   // for readability purposes
              attachments['message'] = attachment.data.message;
              attachments['description'] = obj.description;
              attachments['url'] = obj.target.url;
              try {
                attachments['picture'] = obj.media.image.src;
              } catch(e) {
                console.log('Error assigning picture key to attachments object', e);
              }

              attachments['title'] = obj.title;
              el['attachments'] = attachments;
              delete el.adcreatives;
              otherArray.push(el)
            }
          } // end of if/else that runs if no object_story_id found
        });

        otherArray.forEach(el => {
          data = {};
          // if (el.keywordstats) {
          //   console.log('found keywordstats', el.keywordstats.data)
          // }
          for (let key in el) {
            if (key === "insights") {
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
          // check for carouselData with "if (el.carouselData)"
          if (el.attachments) {
            data['message'] = el.attachments.message;
            data['description'] = el.attachments.description;
            data['url'] = el.attachments.url;
            data['picture'] = el.attachments.picture;
            data['title'] = el.attachments.title;
          } else if (el.carouselData) {
            data['carouselData'] = el.carouselData;
          }
          data['name'] = el.name;
          try {
            data['keywordstats'] = el.keywordstats.data;
          } catch(e) {
            console.log('Problem getting keywordstats', e);
          }

          data['campaign_id'] = el.campaign_id;
          data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
          data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
          data['cpc'] = data.spend / data.clicks;
          delete data['unique_actions'];
          delete data['cost_per_unique_action_type'];

          masterArray.push(data);
        });
        } catch(e) {
            console.log('Error pulling Ads data', e);
        }
        try {
          masterArray.forEach(adDataObj => { // inserts data into Mongo
            Ads.insert({
              data: adDataObj
            });
          });
        } catch (e) {
          console.log('Error inserting data into DB', e);
        } finally {
          return "success!"
        }
    }
});

Meteor.publish('AdsList', function (opts) {
    if (! opts) {
      return Ads.find({}); //publish all ads
    } else {
      return Ads.find({'data.campaign_id': opts});
    }
})
