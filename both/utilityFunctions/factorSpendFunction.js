const defineAction = function defineAction (init, index) {
  let action;
  init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[index].dealType === "CPL" ? action = "like" : '';
  init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';
  return action;
}

export const calcFactorSpend = {
  calcFactorSpend: (quotedPrice, campaignData, init, index) => {
    let action = defineAction(init, index);
    let effectiveNum = init.lineItems[index].effectiveNum;
    let percentage = (parseFloat(init.lineItems[index].percentTotalPercent) / 100);
    if (action === "impressions") {
      let cpm = accounting.unformat(campaignData.cpm);
      if (cpm <= effectiveNum) {

        // cpm = parseFloat(cpm.toFixed(2));
        effectiveNum = (cpm / percentage);
        console.log(effectiveNum, cpm, percentage, campaignData)
        return (campaignData[action] / 1000) * effectiveNum;
      } else if ((cpm > effectiveNum && cpm < quotedPrice) || cpm >= quotedPrice) {
        return (campaignData[action] / 1000) * quotedPrice;
      }
    } else if (action === "clicks") {
      let cpc = accounting.unformat(campaignData.cpc);
      if (cpc <= effectiveNum) {
        cpc = parseFloat(cpc.toFixed(2));
        effectiveNum = (cpc / percentage);
        return (campaignData[action]) * effectiveNum;
      } else if ((cpc > effectiveNum && cpc < quotedPrice) || cpc >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "like") {
      let cpl = accounting.unformat(campaignData.cpl);
      if (cpl <= effectiveNum) {
        cpl = parseFloat(cpl.toFixed(2));
        effectiveNum = (cpl / percentage);
        return (campaignData[action]) * effectiveNum;
      } else if ((cpl > effectiveNum && cpl < quotedPrice) || cpl >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "video_view") {
      let cpvv = accounting.unformat(campaignData['cost_per_video_view']);
      if (cpvv <= effectiveNum) {
        cpvv = parseFloat(cpvv.toFixed(2));
        effectiveNum = (cpvv / percentage);
        return (campaignData[action]) * effectiveNum;
      } else if ((cpvv > effectiveNum && cpvv < quotedPrice) || cpvv >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    }
  }
}
