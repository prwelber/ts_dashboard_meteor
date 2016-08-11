const lower = function lower (objective) {
  let word = objective[0]
  for (let i = 1; i < objective.length; i++) {
    if (objective[i - 1] === " ") {
      word += objective[i].toUpperCase();
    } else {
      word += objective[i].toLowerCase();
    }
  }
  return word;
}


export const getLineItem = {
  // get the correct line item if I have the campaignInsight and initiative
  getLineItem: (campaignData, initiative) => {
    const objective = campaignData.objective.replace(/_/g, " ");
    const word = lower(objective);
    let lineItem = _.where(initiative.lineItems, {objective: word})[0]; // returns an array
    let index;
    if (lineItem === undefined) {
      index = 0;
      lineItem = initiative.lineItems;
    }
    index = parseInt(lineItem.name.substring(lineItem.name.length, lineItem.name.length - 1)) - 1; // minus 1 to account for zero indexing of lineItems array
    return initiative.lineItems[index];
  }
}
