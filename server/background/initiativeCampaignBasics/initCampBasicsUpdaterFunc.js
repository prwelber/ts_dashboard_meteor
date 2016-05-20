import { Meteor } from 'meteor/meteor';



export const basicsUpdater = {
  arrayDiffer: (oldArray, newArray) => {
    /*
      to get diff between two arrays of campaign_ids use this:
      var old = new Set([1,2,3,4,5,6,7,8,9,10])
      var newest = new Set([5,6,7,8,9,10,11,12,13,20,14,15,1,2,3])
      var target = [];
      newest.forEach((el) => {
        if (!old.has(el)) {
          target.push(el)
        }
      })
    */
    const original = new Set(oldArray);
    const updated = new Set(newArray);
    const target = [];
    updated.forEach((el) => {
      if (!original.has(el)) {
        target.push(el);
      }
    });
    return target;
  }
};
