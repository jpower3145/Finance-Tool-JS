// Moved clean function to global scope so the switch statement can use it too
export const clean = (val) => Number(String(val).replace(/[£,]/g, ''));

export const balance = (net_worth) => {
  let current = 0;

  for (let x = 0; x < net_worth.length; x++) 
    current += net_worth[x]['principal']
  
  return current;
}
export const growth = (net_worth) => {
  let low_total = 0;
  let total = 0;
  let high_total = 0;

  
  for (let x = 0; x < net_worth.length; x++) {
    // Fixed the object keys to match what is pushed in the switch statement
    const p = net_worth[x]['principal'];
    const c = net_worth[x]['contribution'];
    const t = net_worth[x]['years'];

    if(net_worth[x]['flag'] == 'i'){
      // Loop through 0, 0.02, and 0.04 to get 6%, 8%, and 10%
      for (let i = 0; i <= 0.04; i += 0.02) {
        let growth_rate = 1.06 + i;
        
        const compoundPrincipal = p * (growth_rate ** t);
        const compoundSeries = c * ((growth_rate ** t - 1) / (growth_rate - 1));
        const finalAmount = Math.round(compoundPrincipal + compoundSeries);
        
        // Fixed the decimal checks to look for 0.02 and 0.04. 
        // Using Math.round to avoid JavaScript's floating point math errors
        const checkVal = Math.round(i * 100); 
        
        if (checkVal === 0) low_total += finalAmount;
        if (checkVal === 2) total += finalAmount;
        if (checkVal === 4) high_total += finalAmount;
      }  
    }else{
      //assumes cash grows at 3%
      const compoundPrincipal = p * (1.03 ** t);
      const compoundSeries = c * ((1.03 ** t - 1) / (1.03 - 1));
      const finalAmount = Math.round(compoundPrincipal + compoundSeries);  
      low_total += finalAmount;
      total += finalAmount;
      high_total += finalAmount;    
    }
  }

  // Returning a formatted string so you can see all three projections
  return {low_total, total, high_total};
};
