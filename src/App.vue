<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { get, set } from 'idb-keyval'
import { growth, balance } from './useCalculator'

import AddAssetForm from './components/AddAssetForm.vue'
import PortfolioLedger from './components/PortfolioLedger.vue'
import NetWorthSummary from './components/NetWorthSummary.vue'
import AssetChart from './components/AssetChart.vue'

const netWorth = ref([])

// 1. Pull existing net worth data out of your phone's storage on app load
onMounted(async () => {
  const savedLedger = await get('user_net_worth')
  if (savedLedger) {
    netWorth.value = savedLedger
  }
})

// 2. Automatically save the historical data array locally whenever it's edited
watch(netWorth, async (newLedger) => {
  await set('user_net_worth', JSON.parse(JSON.stringify(newLedger)))
}, { deep: true })

const results = computed(() => {
  return typeof growth === 'function'
    ? growth(netWorth.value)
    : { timeline: [], paths: { low: "", average: "", high: "" }, points: { low: [], average: [], high: [] }, gridLines: [], xLabels: [], viewBox: "0 0 600 300" }
})

const timelineData = computed(() => results.value.timeline || [])

const finalProjection = computed(() => {
  const timeline = timelineData.value
  return (!timeline || timeline.length === 0) ? { low: 0, average: 0, high: 0 } : timeline[timeline.length - 1]
})

const check_bal = computed(() => typeof balance === 'function' ? balance(netWorth.value) : 0)

const handleNewAsset = (asset) => { netWorth.value.push(asset) }
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Financial Projections Dashboard</h1>
      <a href="/help.html" class="btn-help"><span class="help-icon">?</span> Help Guide</a>
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
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background-color: #f8fafc; }
</style>

<style scoped>
.app-container { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; padding: 40px 20px; }
.app-header { max-width: 1000px; margin: 0 auto 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.app-header h1 { font-size: 24px; font-weight: 700; color: #0f172a; }
.btn-help { display: inline-flex; align-items: center; gap: 6px; background-color: #ffffff; border: 1px solid #cbd5e1; color: #475569; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; }
.btn-help:hover { background-color: #f1f5f9; color: #0f172a; }
.help-icon { background-color: #cbd5e1; color: #475569; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; }
.dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 1000px; margin: 0 auto; }
@media (min-width: 768px) { .dashboard-grid { grid-template-columns: 3fr 2fr; } }
</style>
