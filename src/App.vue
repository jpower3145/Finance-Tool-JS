<script setup>
import { ref, computed } from 'vue'
import { growth, balance } from './useCalculator'

import AddAssetForm from './components/AddAssetForm.vue'
import PortfolioLedger from './components/PortfolioLedger.vue'
import NetWorthSummary from './components/NetWorthSummary.vue'
import AssetChart from './components/AssetChart.vue'

const netWorth = ref([])

// Ensure fallback in case 'useCalculator' functions aren't fully resolved during prototyping
const results = computed(() => {
  return typeof growth === 'function' ? growth(netWorth.value) : { low_total: 0, total: 0, high_total: 0 }
})
const check_bal = computed(() => {
  return typeof balance === 'function' ? balance(netWorth.value) : 0
})

const handleNewAsset = (asset) => {
  netWorth.value.push(asset)
}


</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Financial Projections Dashboard</h1>
      <a href="/help.html" class="btn-help">
          <span class="help-icon">?</span> Help Guide
        </a>
    </header>
    
    <main class="dashboard-grid">
      
      <section class="left-panel">
        <AddAssetForm @add-asset="handleNewAsset" />
        <PortfolioLedger v-if="netWorth.length > 0" :netWorth="netWorth" />
      </section>

      <section class="right-panel">
        <NetWorthSummary :results="results" :check_bal="check_bal" />
        <AssetChart v-if="netWorth.length > 0" :netWorth="netWorth" />
      </section>

    </main>
  </div>
</template>

<style>
/* Global Resets */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background-color: #f8fafc; }
</style>

<style scoped>
.app-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
  padding: 40px 20px;
}

/* Header Layout Container */
.app-header {
  max-width: 1000px;
  margin: 0 auto 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 20px;
  
  /* Pushes h1 to the left and button to the far right */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Base Title Style */
.app-header h1 { 
  font-size: 24px; 
  font-weight: 700; 
  color: #0f172a; 
}

/* New Help Button Styles */
.btn-help {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-help:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

/* Small visual decoration for the question mark */
.help-icon {
  background-color: #cbd5e1;
  color: #475569;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.btn-help:hover .help-icon {
  background-color: #0f172a;
  color: #ffffff;
}

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
</style>
