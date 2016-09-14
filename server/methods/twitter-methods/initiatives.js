import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { email } from '../../sendgrid/email';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import CampaignBasics from '/collections/CampaignBasics';

Meteor.methods({
  assignTwitterCampaignToInitiative: (initName, twitterCampName) => {
    if (initName && twitterCampName) {
      CampaignBasics.update(
        {'data.name': twitterCampName},
        {$set: {'data.initiative': initName}}
      )
    }
    return 'ok';
  }
});
