<script setup>
defineProps({
  netWorth: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="card ledger-card">
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
</template>

<style scoped>
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card h2 { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #334155; }
.portfolio-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.portfolio-table th { text-align: left; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 500; }
.portfolio-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
.text-right { text-align: right !important; }
</style>
