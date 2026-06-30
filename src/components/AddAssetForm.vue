<script setup>
import { ref, computed } from 'vue'
import { assetHierarchy, assetDescriptions, getAccountName, getAssetClass } from '../config/assets'

// Tracks the string name of the active category (e.g., 'Stocks', 'Cash'). 
// If null, all tooltips are hidden.
const activeTooltip = ref(null)

function toggleTooltip(category) {
  // If the clicked tooltip is already open, close it (set to null).
  // Otherwise, open the one that was clicked.
  activeTooltip.value = activeTooltip.value === category ? null : category
}

const emit = defineEmits(['add-asset'])

const newAccount = ref({ type: '', principal: '', contribution: '', years_growing: '' })
const selectedCategory = ref('')

const balanceLabel = computed(() => {
  if (newAccount.value.type === '9') return 'Current Annual Payout (£)'
  if (newAccount.value.type === '10') return 'Valuation of Property Owned (£)'
  return 'Current Balance (£)'
})

const showContribution = computed(() => !['9', '10'].includes(newAccount.value.type))
const showYears = computed(() => newAccount.value.type !== '9')

const selectCategory = (category) => {
  selectedCategory.value = category
  newAccount.value.type = '' 
}

const addAccount = () => {

  const cleanNum = (val) => typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]+/g,"")) || 0;
  
  let amount = cleanNum(newAccount.value.principal);
  let monthly = cleanNum(newAccount.value.contribution) || 0;
  let years_growing = cleanNum(newAccount.value.years_growing) || 10;
  
  if ((!amount && amount !== 0) || !newAccount.value.type) return;

  let processedCont = monthly * 12
  let flag = 'i' 
  
  if (newAccount.value.type === '9') {
    amount = amount * 20; 
    processedCont = 0;
    flag = 'db';
  }

  if (newAccount.value.type === '2') processedCont *= 2
  if (['3', '5', '6'].includes(newAccount.value.type)) processedCont *= 1.25 
  if (['4', '5', '7','10'].includes(newAccount.value.type)) flag = 'c'

  emit('add-asset', {
    id: Date.now(), 
    typeLabel: getAccountName(newAccount.value.type),
    assetClass: getAssetClass(newAccount.value.type),
    principal: amount,
    contribution: processedCont,
    years: years_growing,
    flag: flag
  })

  newAccount.value.principal = ''
  newAccount.value.contribution = ''
  newAccount.value.years_growing = ''
  newAccount.value.type = ''
  selectedCategory.value = ''
}
</script>

<template>
  <div class="card form-card">
    <h2>Add Asset</h2>
    <div class="form-grid">
      
      <div class="input-group">
        <label>Type</label>
        
        <div class="button-grid">
          <button 
            v-for="category in Object.keys(assetHierarchy)" 
            :key="category"
            :class="['toggle-btn', { active: selectedCategory === category }]"
            @click.prevent="selectCategory(category)"
          >
            {{ category }}
            
            <span class="info-wrapper" @click.stop="toggleTooltip(category)">
              <span class="info-icon">i</span>
              
              <span v-if="activeTooltip === category" class="tooltip-text">
                {{ assetDescriptions[category] }}
              </span>
            </span>
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
</template>

<style scoped>
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card h2 { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #334155; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 20px; }
.input-group { display: flex; flex-direction: column; }
.input-group label { font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }

.button-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.sub-grid { margin-top: -4px; margin-bottom: 0; padding-top: 12px; border-top: 1px dashed #cbd5e1; }

.toggle-btn {
  flex: 1 1 auto; 
  padding: 12px 16px; 
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
  position: relative;
}
.toggle-btn:hover { background-color: #f1f5f9; border-color: #94a3b8; }
.toggle-btn.active { background-color: #0f172a; border-color: #0f172a; color: #ffffff; }

.sub-btn { background-color: #ffffff; }
.sub-btn.active { background-color: #2563eb; border-color: #2563eb; color: #ffffff; }

input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background-color: #f8fafc; transition: border-color 0.2s; }
input:focus { outline: none; border-color: #2563eb; background-color: #fff; }

.btn-primary { width: 100%; background-color: #0f172a; color: white; border: none; border-radius: 6px; padding: 12px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-primary:hover { background-color: #1e293b; }

.info-wrapper { position: absolute; top: 4px; right: 4px; cursor: help; display: inline-block; }
.info-icon { background: rgba(0, 0, 0, 0.2); color: #fff; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-family: serif; font-style: italic; font-weight: bold; transition: background 0.2s; }
.info-wrapper:hover .info-icon { background: #007bff; }
.tooltip-text { visibility: hidden; opacity: 0; width: 180px; background-color: #222; color: #fff; text-align: center; border-radius: 4px; padding: 6px 8px; font-size: 12px; line-height: 1.4; position: absolute; bottom: 130%; left: 50%; transform: translateX(-50%); z-index: 10; transition: opacity 0.2s ease, visibility 0.2s ease; pointer-events: none; }
.tooltip-text::after { content: ""; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: #222 transparent transparent transparent; }
.info-wrapper:hover .tooltip-text { visibility: visible; opacity: 1; }
</style>
