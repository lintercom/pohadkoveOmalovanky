export function contribution({revenueNet,apiCost,paymentFee,refund,supportCost,acquisitionCost,visits,newCustomers,adSpend}){
 const values=[revenueNet,apiCost,paymentFee,refund,supportCost,acquisitionCost,visits,newCustomers,adSpend];if(values.some(v=>!Number.isFinite(v)||v<0))throw Error('INVALID_METRICS');
 const beforeAds=revenueNet-apiCost-paymentFee-refund-supportCost;return {beforeAds,afterAds:beforeAds-acquisitionCost,perVisitor:visits?(beforeAds-acquisitionCost)/visits:null,cac:newCustomers?adSpend/newCustomers:null};
}
export const conversion=(completed,started)=>started>0?completed/started:null;
