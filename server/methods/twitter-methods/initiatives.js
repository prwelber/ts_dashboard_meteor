import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { email } from '../../sendgrid/email';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import CampaignBasics from '/collections/CampaignBasics';

Meteor.methods({
  assignTwitterCampaignToInitiative: (initName, twitterCampName, twitterID) => {
    if (initName && twitterCampName) {
      CampaignBasics.update(
        {'data.name': twitterCampName},
        {$set: {'data.initiative': initName}}
      )

      Initiatives.update(
        {name: initName},
        {$addToSet: {
          campaign_names: twitterCampName,
          campaign_ids: twitterID
          }
        }
      )

    }
    return 'ok';
  }
});
