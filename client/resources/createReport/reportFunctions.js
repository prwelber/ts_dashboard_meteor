import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

export const reportFunctions = {
  buildQuery: (metricsArray) => {
    console.log('metricsArray', metricsArray);
  }
}
