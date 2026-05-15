const readline = require('readline'); 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'JS-SHELL> Add an account: 1 - S&S ISA/GIA, 2 - Workplace Pension, 3 - SIPP, 4 - Cash Savings \nThen enter current amount and monthly contribution (e.g. 1, 10000, 500): ' 
});

let net_worth = [];

// Moved clean function to global scope so the switch statement can use it too
const clean = (val) => Number(String(val).replace(/[£,]/g, ''));

const balance = () => {
  let total = 0;

  for (let x = 0; x < net_worth.length; x++) 
    total += net_worth[x]['principal']
  
  return total;
}
const growth = () => {
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

console.log("Simple JS Shell started. Type 'exit' to quit or 'done' to compute.");
rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();

  if (input.toLowerCase() === 'exit') {
    rl.close(); 
    return;     
  }

  if (input.toLowerCase() === 'done') {
    console.log(balance());
    console.log(growth());
    rl.prompt();
    return; // Stop execution here so it doesn't try to parse 'done' as an account
  }

  try {
    const args = input.split(',');
    const cleanArgs = args.map(arg => arg.trim());

    // Clean the inputs immediately so math operations (* 12) work properly
    const amount = clean(cleanArgs[1]);
    const monthlyCont = clean(cleanArgs[2]);

    switch (cleanArgs[0]) {
      case '1': // gia/s&s isa
        net_worth.push({
          'principal': amount,
          'contribution': monthlyCont * 12,
          'years': 10,
          'flag' : 'i'
        });
        console.log("Added S&S ISA/GIA.");
        break; // Added missing break
      
      case '2': // wp
        net_worth.push({
          'principal': amount,
          // Assuming the * 2 here is to account for an exact 100% employer match
          'contribution': monthlyCont * 2 * 12, 
          'years': 10,   
          'flag' : 'i'
        });
        console.log("Added Workplace Pension.");
        break; // Added missing break
      
      case '3': // sipp
        net_worth.push({
          'principal': amount,
          // 1.25 accounts for basic rate tax relief
          'contribution': monthlyCont * 1.25 * 12,
          'years': 10,   
          'flag' : 'i'
        });
        console.log("Added SIPP.");
        break; // Added missing break
      
      case '4':
        net_worth.push({
          'principal': amount,
          'contribution': monthlyCont * 12,
          'years': 10,    
          'flag' : 'c' //flag specific to cash so 3 percent growth
        });
        console.log("Added Cash Account.");
        break; // Added missing break
      
      default:
        console.log("Invalid account type. Use 1, 2, 3, or 4.");
        break;
    }
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }

  rl.prompt();

}).on('close', () => {
  console.log('\nExiting shell...');
  process.exit(0);
});