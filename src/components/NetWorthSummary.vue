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

    <div v-if="results && results.paths" class="card chart-card">
      <h3 class="chart-title">Portfolio Growth Trajectory</h3>
      
      <div class="chart-container">
        <svg :viewBox="results.viewBox" class="svg-element">
          <g stroke="#f1f5f9" stroke-width="1.5" stroke-dasharray="4 4">
            <line v-for="line in results.gridLines" :key="'line-'+line.y" x1="70" :y1="line.y" x2="580" :y2="line.y" />
          </g>

          <text v-for="line in results.gridLines" :key="'lbl-y-'+line.y" x="60" :y="parseFloat(line.y) + 4" text-anchor="end" class="y-axis-label">
            {{ line.label }}
          </text>

          <text v-for="xl in results.xLabels" :key="'lbl-x-'+xl.x" :x="xl.x" y="285" text-anchor="middle" class="x-axis-label">
            {{ xl.label }}
          </text>

          <path :d="results.paths.low" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
          <path :d="results.paths.average" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <path :d="results.paths.high" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />

          <g v-for="(pt, index) in results.points.high" :key="'high-pt-'+pt.year" class="node-group">
            <circle :cx="pt.x" :cy="pt.y" r="8" fill="#10b981" class="hover-circle" />
            <circle :cx="pt.x" :cy="pt.y" r="3.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
            <g class="tooltip-box">
              <rect :x="index === results.timeline.length - 1 ? parseFloat(pt.x) - 80 : (index === 0 ? parseFloat(pt.x) - 10 : parseFloat(pt.x) - 45)" :y="parseFloat(pt.y) - 32" width="90" height="20" rx="4" fill="#0f172a" />
              <text :x="index === results.timeline.length - 1 ? parseFloat(pt.x) - 35 : (index === 0 ? parseFloat(pt.x) + 35 : pt.x)" :y="parseFloat(pt.y) - 18" text-anchor="middle" class="tooltip-text">£{{ pt.value.toLocaleString() }}</text>
            </g>
          </g>

          <g v-for="(pt, index) in results.points.low" :key="'low-pt-'+pt.year" class="node-group">
            <circle :cx="pt.x" :cy="pt.y" r="8" fill="#f43f5e" class="hover-circle" />
            <circle :cx="pt.x" :cy="pt.y" r="3.5" fill="#f43f5e" stroke="#ffffff" stroke-width="1.5" />
            <g class="tooltip-box">
              <rect :x="index === results.timeline.length - 1 ? parseFloat(pt.x) - 80 : (index === 0 ? parseFloat(pt.x) - 10 : parseFloat(pt.x) - 45)" :y="parseFloat(pt.y) - 32" width="90" height="20" rx="4" fill="#0f172a" />
              <text :x="index === results.timeline.length - 1 ? parseFloat(pt.x) - 35 : (index === 0 ? parseFloat(pt.x) + 35 : pt.x)" :y="parseFloat(pt.y) - 18" text-anchor="middle" class="tooltip-text">£{{ pt.value.toLocaleString() }}</text>
            </g>
          </g>

          <g v-for="(pt, index) in results.points.average" :key="'avg-pt-'+pt.year" class="node-group">
            <circle :cx="pt.x" :cy="pt.y" r="10" fill="#3b82f6" class="hover-circle" />
            <circle :cx="pt.x" :cy="pt.y" r="5" fill="#3b82f6" stroke="#ffffff" stroke-width="2" />
            <g class="tooltip-box">
              <rect :x="index === results.timeline.length - 1 ? parseFloat(pt.x) - 80 : (index === 0 ? parseFloat(pt.x) - 10 : parseFloat(pt.x) - 45)" :y="parseFloat(pt.y) - 34" width="90" height="22" rx="4" fill="#1e3a8a" />
              <text :x="index === results.timeline.length - 1 ? parseFloat(pt.x) - 35 : (index === 0 ? parseFloat(pt.x) + 35 : pt.x)" :y="parseFloat(pt.y) - 20" text-anchor="middle" class="tooltip-text" style="font-size: 10px; font-weight: 700;">£{{ pt.value.toLocaleString() }}</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.summary-card { text-align: center; background-color: #0f172a; color: white; border: none; }
.summary-card h2 { color: #94a3b8; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.hero-number { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; }
.chart-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.chart-subtitle { font-size: 12px; color: #94a3b8; margin-bottom: 24px; }
.chart-container { position: relative; width: 100%; }
.svg-element { width: 100%; height: auto; overflow: visible; }
.y-axis-label { font-size: 10px; fill: #94a3b8; font-weight: 500; }
.x-axis-label { font-size: 12px; fill: #64748b; font-weight: 600; }
.node-group { cursor: pointer; }
.hover-circle { opacity: 0; transition: opacity 0.15s ease; }
.node-group:hover .hover-circle { opacity: 0.2; }
.tooltip-box { opacity: 0; pointer-events: none; transition: opacity 0.15s ease; }
.node-group:hover .tooltip-box { opacity: 1; }
.tooltip-text { font-size: 9px; fill: #ffffff; font-weight: 600; }
</style>
