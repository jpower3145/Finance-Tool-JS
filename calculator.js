// Import the 'readline' module to handle terminal input/output
const readline = require('readline'); 

// Configure the interface: link it to the standard input (keyboard) and output (screen)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  // Define the string that appears before the user types
  prompt: 'JS-SHELL> ' 
});

// A standard arrow function; 'name' is the parameter
// The backticks (`) allow "Template Literals" to inject variables using ${}
const calc = (principal, contributions, time, bonus = 0) => {
  // 1. Clean the inputs (removes £ and ,)
  const clean = (val) => Number(String(val).replace(/[£,]/g, ''));
  
  const p = clean(principal);
  const c = clean(contributions);
  const t = Number(time);
  const b = Number(bonus); // Defaulting to 12 for monthly contributions

  const figures = [];

  // 2. Loop through 0, 0.02, and 0.04 to get 6%, 8%, and 10%
  // We use curly braces {} to allow the 'let' declaration inside
  for (let i = 0; i <= 0.04; i += 0.02) {
    let growth = 1.06 + i;
    
    // The compound interest formula for principal + periodic contributions
    const compoundPrincipal = p * (growth ** t);
    const compoundSeries = (c * 1+b) * ((growth ** t - 1) / (growth - 1));
    
    const total = Math.round(compoundPrincipal + compoundSeries);
    
    // 3. Store result with a label for clarity
    figures.push(`${Math.round((growth-1) * 100)}%: £${total.toLocaleString()}`);
  }

  return figures;
};
// Print an initial message to the user
console.log("Simple JS Shell started. Type 'exit' to quit.");

// Display the prompt ('JS-SHELL> ') and wait for input
rl.prompt();

// An event listener: whenever a 'line' (Enter key) is detected, run this block
rl.on('line', (line) => {
  // .trim() removes any leading or trailing whitespace from the user's input
  const input = line.trim();

  // Check if the user wants to quit; convert to lowercase to handle 'EXIT' or 'exit'
  if (input.toLowerCase() === 'exit') {
    rl.close(); // Closes the interface
    return;     // Stop executing the rest of this function
  }

  // We use try/catch so the shell doesn't crash if the user types invalid JS
  try {
    // eval() takes a string and runs it as actual JavaScript code
    // The result of the code is stored in the 'result' variable
    const result = eval(input);
    
    // Log the result of the execution to the console
    console.log(result);
  } catch (err) {
    // If the code fails, catch the error and print just the message (not the whole stack trace)
    console.error(`Error: ${err.message}`);
  }

  // After processing the line, show the prompt again for the next command
  rl.prompt();

// Another event listener: triggered when rl.close() is called or Ctrl+C is pressed
}).on('close', () => {
  console.log('\nExiting shell...');
  // 0 indicates the process finished successfully without a system-level error
  process.exit(0);
});