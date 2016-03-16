Meteor.methods({
  'removeAds': function () {
      console.log('removing Ads collection');
      Ads.remove( {} );
  }
});

Meteor.methods({
  'getAds': function (accountNumber) {
    console.log("getAds running");
    let adsArray = [];
    let otherArray = [];
    let masterArray = [];
    let carouselArray = [];
    let ads;
    try {
        let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/ads?fields=adcreatives{object_story_id},insights,account_id,adset_id,campaign_id,name,id&limit=75&access_token='+token+'', {});
        ads = result;
        // ads variable is now an array of objects
        adsArray.push(ads.data.data);
        adsArray = _.flatten(adsArray);
        adsArray.forEach(el => { // pulls in creative attachments (picture, url, message)
          let attachments = {}
          // make 2nd api call with object_story_id to retrieve attachments
          let attachment = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+el.adcreatives.data[0].object_story_id+'?fields=child_attachments,attachments,message&access_token='+token+'', {});

          // determine if carousel ad
          console.log(attachment.data.child_attachments && attachment.data.attachments.data[0].hasOwnProperty('subattachments'))
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
            let carouselNumbers = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=impressions,inline_link_clicks,actions,website_ctr&action_breakdowns=["action_type","action_carousel_card_id"]&access_token='+token+'', {});
            // console.log(carouselNumbers);
            // console.log(carouselNumbers.data.data[0]);
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

                  // otherArray[0].carouselData.forEach(carousel => {

                  //   if (carousel.id === element.action_carousel_card_id) {
                  //     carousel['link_click'] = element.value;
                  //     carousel['action_carousel_card_id'] = element.action_carousel_card_id;
                  //   }
                  // });
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


                  // otherArray[0].carouselData.forEach(carousel => {

                  //   if (carousel.id === element.action_carousel_card_id) {

                  //     carousel['link_ctr'] = element.value;
                  //     carousel['action_carousel_card_id'] = element.action_carousel_card_id;
                  //   }
                  // });
                });
              }
            } // end of for key in numbers loop

          } else {
            let obj = attachment.data.attachments.data[0];   // for readability purposes
            attachments['message'] = attachment.data.message;
            attachments['description'] = obj.description;
            attachments['url'] = obj.target.url;
            attachments['picture'] = obj.media.image.src;
            attachments['title'] = obj.title;
            el['attachments'] = attachments;
            delete el.adcreatives;
            otherArray.push(el)
          }
        });
        // console.log(otherArray)
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

Meteor.publish('AdsList', function () {
    return Ads.find( {} );
})
