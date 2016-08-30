import DeviceAndPlacement from '/collections/DeviceAndPlacement'
import { apiVersion } from '/server/token/token';
const token = require('/server/token/token.js');

Meteor.methods({
    'removeDevice': function () {
        console.log('removing device and placement breakdowns collection')
        DeviceAndPlacement.remove( {} )
    }
});

Meteor.methods({
    'getDeviceBreakdown': function (accountNumber) {
        let deviceArray = [];
        let masterArray = [];
        let hourlyBreakdown;
        try {

            let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+accountNumber+'/insights?fields=cpm,spend,campaign_id,campaign_name,date_start,date_stop,impressions,objective,reach,video_10_sec_watched_actions,video_15_sec_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_avg_pct_watched_actions,video_complete_watched_actions,clicks,actions,total_actions,cost_per_action_type,cpc&breakdowns=placement,impression_device&date_preset=lifetime&access_token='+token.token+'', {});

            deviceBreakdown = result;
            deviceArray.push(deviceBreakdown.data.data);
            deviceArray = _.flatten(deviceArray);

            deviceArray.forEach(el => {
                let data = {};
                 for (let key in el) {
                    if (key == "actions") {
                        el[key].forEach(el => {
                            // this check looks for a period in the key name and
                            // replaces it with an underscore if found
                            // this check is used two more times below
                            if (/\W/g.test(el.action_type)) {
                                // console.log("before key", el.action_type)
                                el.action_type = el.action_type.replace(/\W/g, "_");
                                // console.log("after key", el.action_type)
                                data[el.action_type] = el.value;
                            }
                            data[el.action_type] = el.value;
                        });
                    } else if (key == "cost_per_action_type") {
                         el[key].forEach(el => {
                            if (/\W/g.test(el.action_type)) {
                                el.action_type = el.action_type.replace(/\W/g, "_");
                                data["cost_per_"+el.action_type] = el.value;
                            } else {
                                data["cost_per_"+el.action_type] = el.value;
                            }
                        });
                    } else {
                        // this check looks for a period in the key name and
                        // replaces it with an underscore
                        if (/\W/g.test(key)) {
                            key = key.replace(/\W/g, "_");
                            data[key] = el[key];
                        } else {
                            data[key] = el[key]
                        }
                    }
                }

                data['impressions'] = parseInt(data.impressions);
                data['campaign_name'] = data.campaign_name;
                data['cpm'] = data.cpm;
                data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
                data['clicks'] = data.clicks;
                data['cpc'] = data.cpc;
                data['placement'] = data.placement;
                data['impression_device'] = data.impression_device;
                masterArray.push(data);
            });
            console.log('masterArray', masterArray);
        } catch(e) {
            console.log("Error pulling device and placement Breakdown, here's the error:", e);
        }
        try {
            masterArray.forEach(el => {
                DeviceAndPlacement.insert({
                    data: el
                });
            });
        } catch(e) {
            console.log('Error inserting device and placement data into DB:', e);
        }
    },
    'refreshDevice': (campaignNumber) => {
      DeviceAndPlacement.remove({'data.campaign_id': campaignNumber});
      return "success!";
    },
    'testDevice': () => {
        console.log('test method running');
        return 'fired!'
    }
});


Meteor.publish("DeviceAndPlacement", function (params) {
    return DeviceAndPlacement.find({'data.campaign_id': params});
});
