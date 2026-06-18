# Financial Projections Dashboard

A financial modeling tool built with Vue 3. This application allows users to forecast long-term wealth accumulation across multiple asset types using compound interest formulas.

## Features

* **Diverse Asset Tracker:** Add and track various financial accounts including S&S ISAs, Workplace Pensions, SIPPs, and Cash Savings.
* **Real-Time Projections:** Instantly calculates multi-year compound growth across three market scenarios: Pessimistic (6%), Average (8%), and Optimistic (10%).
* **Tax & Match Logic:** Automatically applies standard UK gross-up multipliers for pension contributions (e.g., Employer Matches and Basic Rate Tax Relief).
* **Visual Asset Allocation:** Integrates an interactive pie chart to visualize the distribution of wealth across the portfolio.

## Technology Used

* **Framework:** Vue 3 (Composition API)
* **Build Tool:** Vite
* **Data Visualization:** Chart.js & vue-chartjs
* **Styling:** Vanilla CSS (Scoped)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes installed with Node.js)

### Installation

Clone the repository:

Bash
git clone https://github.com/jpower3145/Finance-Tool-JS
Navigate into the project directory:

Bash
cd financial-projections-dashboard
Install the dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Open your browser and navigate to http://localhost:5173. (or terminal prompted port)

### Using the Tool

Select an Account Type from the dropdown menu.

Enter your Current Balance and Monthly Contribution.

Press Enter or click Add to Portfolio.

The application will immediately update your Current Net Worth, redraw the Asset Allocation chart, and calculate your 10-year compound growth projections.

### Project Structure
src/financialApp.vue: The main application view and UI layout.

src/useCalculator.js: Extracted mathematical logic for cleaning inputs, calculating total balances, and forecasting compound growth.

### License
Distributed under the MIT License. See LICENSE for more information.
