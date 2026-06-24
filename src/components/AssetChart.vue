<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  netWorth: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  if (props.netWorth.length === 0) {
    return { labels: [], datasets: [{ data: [] }] }
  }

  const groupedAssets = props.netWorth.reduce((accumulator, asset) => {
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
          '#2563eb', '#64748b', '#38bdf8', '#0f172a', '#94a3b8'
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
  <div class="card chart-card">
    <h2>Asset Allocation</h2>
    <div class="chart-container">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card h2 { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #334155; }
.chart-container { position: relative; height: 250px; width: 100%; display: flex; justify-content: center; margin-top: 10px; }
</style>
