<script setup>
defineProps({
  results: Object,
  check_bal: Number
})
</script>

<template>
  <div>
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
  </div>
</template>

<style scoped>
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.summary-card { text-align: center; background-color: #0f172a; color: white; border: none; }
.summary-card h2 { color: #94a3b8; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.hero-number { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; }
.projections-card h2 { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #334155; }
.projection-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.projection-item:last-child { border-bottom: none; }
.proj-label { color: #475569; font-size: 14px; }
.proj-value { font-weight: 600; color: #0f172a; }
.highlight { background-color: #eff6ff; margin: 0 -24px; padding: 16px 24px; border: 1px solid #bfdbfe; }
.text-accent { color: #2563eb; font-size: 18px; }
</style>
