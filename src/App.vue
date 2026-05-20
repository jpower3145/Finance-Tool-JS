<script setup>
import { ref, computed } from 'vue'
import { clean, growth, balance } from './useCalculator'

const netWorth = ref([])
const newAccount = ref({ type: '1', principal: '', contribution: '' })

const results = computed(() => growth(netWorth.value))
const check_bal = computed(() => balance(netWorth.value))

// Helper to translate the type ID to a readable string for the table
const getAccountName = (type) => {
  const types = { '1': 'S&S ISA / GIA', '2': 'Workplace Pension', '3': 'SIPP', '4': 'Cash' }
  return types[type] || 'Unknown'
}

const addAccount = () => {
  const amount = clean(newAccount.value.principal)
  const monthly = clean(newAccount.value.contribution)
  
  // Validation: Don't add if inputs are completely empty or invalid
  if (!amount && !monthly) return;

  let processedCont = monthly * 12
  let flag = 'i'
  
  if (newAccount.value.type === '2') processedCont *= 2
  if (newAccount.value.type === '3') processedCont *= 1.25
  if (newAccount.value.type === '4') flag = 'c'

  netWorth.value.push({
    id: Date.now(), // Unique ID for Vue's v-for loop
    typeLabel: getAccountName(newAccount.value.type),
    principal: amount,
    contribution: processedCont,
    years: 10,
    flag: flag
  })

  newAccount.value.principal = ''
  newAccount.value.contribution = ''
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Financial Projections Dashboard</h1>
      <p class="subtitle">10-Year Compound Growth Modeler</p>
    </header>
    
    <main class="dashboard-grid">
      
      <section class="left-panel">
        
        <div class="card form-card">
          <h2>Add Asset</h2>
          <div class="form-grid">
            <div class="input-group">
              <label>Account Type</label>
              <select v-model="newAccount.type">
                <option value="1">S&S ISA or GIA</option>
                <option value="2">Workplace Pension</option>
                <option value="3">SIPP</option>
                <option value="4">Cash</option>
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
          <h2>10-Year Projections</h2>
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
.projection-item:last-child { border-bottom: none; }
.proj-label { color: #475569; font-size: 14px; }
.proj-value { font-weight: 600; color: #0f172a; }

.highlight { background-color: #eff6ff; margin: 0 -24px; padding: 16px 24px; border: 1px solid #bfdbfe; }
.text-accent { color: #2563eb; font-size: 18px; }
</style>