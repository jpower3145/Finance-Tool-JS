<script setup>
import { ref, computed } from 'vue'
import { clean, growth, balance } from './useCalculator'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const netWorth = ref([])
const newAccount = ref({ type: '1', principal: '', contribution: '', years_growing: '' })

const results = computed(() => growth(netWorth.value))
const check_bal = computed(() => balance(netWorth.value))

// Helper to translate the type ID to a readable string for the table
const getAccountName = (type) => {
  const types = { '1': 'Stocks/Shares', '2': 'Workplace Pension', '3': 'SIPP', '4': 'Cash' }
  return types[type] || 'Unknown'
}

const addAccount = () => {
  const amount = clean(newAccount.value.principal)
  const monthly = clean(newAccount.value.contribution)
  const years_growing = clean(newAccount.value.years_growing)
  
  //check if not everything is entered
  if (!amount && !monthly) return;

  let processedCont = monthly * 12
  let flag = 'i'
  
  //rule of thumb that pension contributions at least double capital
  if (newAccount.value.type === '2') processedCont *= 2
  //sipp contributions add 25% bonus at least 
  if (newAccount.value.type === '3') processedCont *= 1.25 

  if (newAccount.value.type === '4') flag = 'c'

  netWorth.value.push({
    id: Date.now(), // Unique ID for Vue's v-for loop
    typeLabel: getAccountName(newAccount.value.type),
    principal: amount,
    contribution: processedCont,
    years: years_growing,
    flag: flag
  })

  newAccount.value.principal = ''
  newAccount.value.contribution = ''
  newAccount.value.years_growing = ''

}

const chartData = computed(() => {
  // If the ledger is empty, return empty arrays to prevent crashes
  if (netWorth.value.length === 0) {
    return { labels: [], datasets: [{ data: [] }] }
  }

  return {
    // Extract just the labels (e.g., "S&S ISA", "Cash")
    labels: netWorth.value.map(asset => asset.typeLabel),
    datasets: [
      {
        // Extract just the principal amounts
        data: netWorth.value.map(asset => asset.principal),
        // A corporate slate/blue color palette to match your CSS
        backgroundColor: [
          '#2563eb', // Royal Blue
          '#64748b', // Slate
          '#38bdf8', // Light Blue
          '#0f172a', // Dark Navy
          '#94a3b8'  // Light Gray
        ],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  }
})

</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Financial Projections Dashboard</h1>
    </header>
    
    <main class="dashboard-grid">
      
      <section class="left-panel">
        
        <div class="card form-card">
          <h2>Add Asset</h2>
          <div class="form-grid">
            <div class="input-group">
              <label>Account Type</label>
              <select v-model="newAccount.type">
                <option value="1">Stocks & Shares ISA or GIA</option>
                <option value="2">Workplace Pension</option>
                <option value="3">SIPP</option>
                <option value="4">Cash ISA or Savings</option>
              </select>
            </div>
            
        <div class="input-group">
          <label>Current Balance (£)</label>
          <input 
            type="text" 
            v-model="newAccount.principal" 
            placeholder="0.00" 
            @keyup.enter="addAccount"
          />
        </div>

        <div class="input-group">
          <label>Monthly Contribution (£)</label>
          <input 
            type="text" 
            v-model="newAccount.contribution" 
            placeholder="0.00" 
            @keyup.enter="addAccount"
          />
        </div>

        <div class="input-group">
          <label>Expected Years Invested</label>
          <input 
            type="text" 
            v-model="newAccount.years_growing" 
            placeholder="Aim for 5+ on riskier investments" 
            @keyup.enter="addAccount"
          />
        </div>
        
        </div>
          <button class="btn-primary" @click="addAccount">Add to Portfolio</button>
        </div>

        <div class="card ledger-card" v-if="netWorth.length > 0">
          <h2>Current Portfolio</h2>
          <table class="portfolio-table">
            <thead>
              <tr>
                <th>Asset Type</th>
                <th class="text-right">Principal</th>
                <th class="text-right">Annual Cont.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asset in netWorth" :key="asset.id">
                <td>{{ asset.typeLabel }}</td>
                <td class="text-right">£{{ asset.principal.toLocaleString() }}</td>
                <td class="text-right">£{{ asset.contribution.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      <section class="right-panel">
        <div class="card summary-card">
          <h2>Current Net Worth</h2>
          <p class="hero-number">£{{ check_bal?.toLocaleString() || '0' }}</p>
        </div>

        <div class="card projections-card">
          <h2>Projections</h2>
          <div class="projection-item">
            <span class="proj-label">Pessimistic (6%)</span>
            <span class="proj-value">£{{ results?.low_total?.toLocaleString() || '0' }}</span>
          </div>
          <div class="projection-item highlight">
            <span class="proj-label">Average (8%)</span>
            <span class="proj-value text-accent">£{{ results?.total?.toLocaleString() || '0' }}</span>
          </div>
          <div class="projection-item">
            <span class="proj-label">Optimistic (10%)</span>
            <span class="proj-value">£{{ results?.high_total?.toLocaleString() || '0' }}</span>
          </div>
        </div>

        <div class="card chart-card" v-if="netWorth.length > 0">
          <h2>Asset Allocation</h2>
          <div class="chart-container">
            <Pie :data="chartData" :options="chartOptions" />
          </div>
        </div>

      </section>

    </main>
  </div>
</template>

<style scoped>
/* Reset & Base Variables for a professional look */
* { box-sizing: border-box; margin: 0; padding: 0; }

.app-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
  padding: 40px 20px;
}

/* Header */
.app-header {
  max-width: 1000px;
  margin: 0 auto 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 20px;
}
.app-header h1 { font-size: 24px; font-weight: 700; color: #0f172a; }
.subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }

/* Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .dashboard-grid { grid-template-columns: 3fr 2fr; }
}

/* Cards */
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.card h2 { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #334155; }

/* Forms */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.input-group { display: flex; flex-direction: column; }
.input-group label { font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }

input, select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8fafc;
  transition: border-color 0.2s;
}
input:focus, select:focus { outline: none; border-color: #2563eb; background-color: #fff; }

.btn-primary {
  width: 100%;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primary:hover { background-color: #1e293b; }

/* Table */
.portfolio-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.portfolio-table th { 
  text-align: left; 
  padding-bottom: 12px; 
  border-bottom: 1px solid #e2e8f0; 
  color: #64748b; 
  font-weight: 500; 
}
.portfolio-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
.text-right { text-align: right !important; }

/* Results UI */
.summary-card { text-align: center; background-color: #0f172a; color: white; border: none; }
.summary-card h2 { color: #94a3b8; }
.hero-number { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; }

.projection-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

/* Chart Container */
.chart-container {
  position: relative;
  height: 250px; /* Forces the pie to a nice, compact size */
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.projection-item:last-child { border-bottom: none; }
.proj-label { color: #475569; font-size: 14px; }
.proj-value { font-weight: 600; color: #0f172a; }

.highlight { background-color: #eff6ff; margin: 0 -24px; padding: 16px 24px; border: 1px solid #bfdbfe; }
.text-accent { color: #2563eb; font-size: 18px; }
</style>