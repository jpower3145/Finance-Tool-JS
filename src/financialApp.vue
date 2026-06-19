<script setup>
import { ref, computed } from 'vue'
import { clean, growth, balance } from './useCalculator'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const netWorth = ref([])
const newAccount = ref({ type: '', principal: '', contribution: '', years_growing: '' })
const selectedCategory = ref('')

// 1. Updated Hierarchy with DB Pension and Property
const assetHierarchy = {
  'ISA': [
    { id: '4', label: 'Cash' }, 
    { id: '1', label: 'Stocks & Shares' }
  ],
  'LISA': [
    { id: '5', label: 'Cash' },
    { id: '6', label: 'Stocks & Shares' }
  ],
  'Pension': [
    { id: '2', label: 'Workplace (DC)' },
    { id: '3', label: 'SIPP' },
    { id: '9', label: 'Defined Benefit' } // New ID
  ],
  'Savings/Investments': [
    { id: '7', label: 'Cash Savings' },
    { id: '8', label: 'General Investment Account (GIA)' }
  ],
  'Property': [
    { id: '10', label: 'Property Equity' } // New ID
  ]
}

const results = computed(() => growth(netWorth.value))
const check_bal = computed(() => balance(netWorth.value))

// 2. Updated Naming Maps
const getAccountName = (type) => {
  const types = { 
    '1': 'Stocks & Shares ISA', 
    '2': 'Workplace Pension', 
    '3': 'SIPP', 
    '4': 'Cash ISA', 
    '5': 'Cash LISA',
    '6': 'Stocks & Shares LISA',
    '7': 'Cash Savings',
    '8': 'General Investment Account',
    '9': 'Defined Benefit Pension',
    '10': 'Property Equity'
  }
  return types[type] || 'Unknown'
}

const getAssetClass = (type) => {
  const classes = {
    '1': 'Stocks & Shares',
    '2': 'Pensions',
    '3': 'Pensions',
    '4': 'Cash',
    '5': 'Cash',
    '6': 'Stocks & Shares',
    '7': 'Cash',
    '8': 'Stocks & Shares',
    '9': 'Pensions',
    '10': 'Property'
  }
  return classes[type] || 'Other'
}

// 3. Dynamic UI Computed Properties
const balanceLabel = computed(() => {
  if (newAccount.value.type === '9') return 'Current Annual Payout (£)'
  if (newAccount.value.type === '10') return 'Property Valuation (£)'
  return 'Current Balance (£)'
})

const showContribution = computed(() => {
  // DB Pensions and Property don't use regular monthly cash contributions in this model
  return !['9', '10'].includes(newAccount.value.type)
})

const showYears = computed(() => {
  // DB Pensions are treated as a static terminal value, so years don't apply
  return newAccount.value.type !== '9'
})

const selectCategory = (category) => {
  selectedCategory.value = category
  newAccount.value.type = '' 
}

// 4. Refactored Math Logic
const addAccount = () => {
  let amount = clean(newAccount.value.principal)
  let monthly = clean(newAccount.value.contribution) || 0
  let years_growing = clean(newAccount.value.years_growing) || 10
  
  // Validation: Must have at least a principal/payout value and a selected type
  if ((!amount && amount !== 0) || !newAccount.value.type) return;

  let processedCont = monthly * 12
  let flag = 'i' // Default to Investment growth (6/8/10%)
  
  // --- SPECIAL ACCOUNT OVERRIDES ---

  if (newAccount.value.type === '9') {
    amount = amount * 20; // DB 20x Valuation Rule
    processedCont = 0;
    flag = 'db';
  }

  // --- STANDARD ACCOUNT MODIFIERS ---
  
  if (newAccount.value.type === '2') processedCont *= 2
  if (['3', '5', '6'].includes(newAccount.value.type)) processedCont *= 1.25 
  if (['4', '5', '7','10'].includes(newAccount.value.type)) flag = 'c'

  // Push to Ledger
  netWorth.value.push({
    id: Date.now(), 
    typeLabel: getAccountName(newAccount.value.type),
    assetClass: getAssetClass(newAccount.value.type),
    principal: amount,
    contribution: processedCont,
    years: years_growing,
    flag: flag
  })

  // Reset State
  newAccount.value.principal = ''
  newAccount.value.contribution = ''
  newAccount.value.years_growing = ''
  newAccount.value.type = ''
  selectedCategory.value = ''
}

// 5. Chart Grouping
const chartData = computed(() => {
  if (netWorth.value.length === 0) {
    return { labels: [], datasets: [{ data: [] }] }
  }

  const groupedAssets = netWorth.value.reduce((accumulator, asset) => {
    if (!accumulator[asset.assetClass]) {
      accumulator[asset.assetClass] = 0;
    }
    accumulator[asset.assetClass] += asset.principal;
    return accumulator;
  }, {}); 

  return {
    labels: Object.keys(groupedAssets), 
    datasets: [
      {
        data: Object.values(groupedAssets), 
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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) { label += ': '; }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(context.parsed);
          }
          return label;
        }
      }
    }
  }
}
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
              <label>Asset Category</label>
              
              <div class="button-grid">
                <button 
                  v-for="category in Object.keys(assetHierarchy)" 
                  :key="category"
                  :class="['toggle-btn', { active: selectedCategory === category }]"
                  @click.prevent="selectCategory(category)"
                >
                  {{ category }}
                </button>
              </div>

              <div class="button-grid sub-grid" v-if="selectedCategory && assetHierarchy[selectedCategory].length > 0">
                <button 
                  v-for="sub in assetHierarchy[selectedCategory]" 
                  :key="sub.id"
                  :class="['toggle-btn sub-btn', { active: newAccount.type === sub.id }]"
                  @click.prevent="newAccount.type = sub.id"
                >
                  {{ sub.label }}
                </button>
              </div>
            </div>
            
            <div class="input-group" v-if="newAccount.type">
              <label>{{ balanceLabel }}</label>
              <input 
                type="text" 
                v-model="newAccount.principal" 
                placeholder="0.00" 
                @keyup.enter="addAccount"
              />
            </div>

            <div class="input-group" v-if="newAccount.type && showContribution">
              <label>Monthly Contribution (£)</label>
              <input 
                type="text" 
                v-model="newAccount.contribution" 
                placeholder="0.00" 
                @keyup.enter="addAccount"
              />
            </div>

            <div class="input-group" v-if="newAccount.type && showYears">
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
                <th class="text-right">Annual Contribution</th>
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
            <span class="proj-label">Pessimistic</span>
            <span class="proj-value">£{{ results?.low_total?.toLocaleString() || '0' }}</span>
          </div>
          <div class="projection-item highlight">
            <span class="proj-label">Average</span>
            <span class="proj-value text-accent">£{{ results?.total?.toLocaleString() || '0' }}</span>
          </div>
          <div class="projection-item">
            <span class="proj-label">Optimistic</span>
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
/* Reset & Base Variables */
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

/* Forms & Button Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.input-group { display: flex; flex-direction: column; }
.input-group label { font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }

.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.sub-grid {
  margin-top: -4px;
  margin-bottom: 0;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
}

.toggle-btn {
  flex: 1;
  min-width: 80px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover { background-color: #f1f5f9; border-color: #94a3b8; }
.toggle-btn.active { background-color: #0f172a; border-color: #0f172a; color: #ffffff; }

.sub-btn { background-color: #ffffff; }
.sub-btn.active { background-color: #2563eb; border-color: #2563eb; color: #ffffff; }

input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8fafc;
  transition: border-color 0.2s;
}
input:focus { outline: none; border-color: #2563eb; background-color: #fff; }

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
.portfolio-table th { text-align: left; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 500; }
.portfolio-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
.text-right { text-align: right !important; }

/* Results UI */
.summary-card { text-align: center; background-color: #0f172a; color: white; border: none; }
.summary-card h2 { color: #94a3b8; }
.hero-number { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; }

.projection-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.projection-item:last-child { border-bottom: none; }
.proj-label { color: #475569; font-size: 14px; }
.proj-value { font-weight: 600; color: #0f172a; }
.highlight { background-color: #eff6ff; margin: 0 -24px; padding: 16px 24px; border: 1px solid #bfdbfe; }
.text-accent { color: #2563eb; font-size: 18px; }

.toggle-btn {
  /* 1. Allows buttons to size to their text, but still fill empty row space */
  flex: 1 1 auto; 
  
  /* 2. Makes the buttons fatter/taller */
  padding: 12px 16px; 
  
  /* 3. Ensures long text wraps to a second line instead of cutting off */
  white-space: normal; 
  line-height: 1.3;
  
  min-width: 80px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Chart Container */
.chart-container { position: relative; height: 250px; width: 100%; display: flex; justify-content: center; margin-top: 10px; }
</style>