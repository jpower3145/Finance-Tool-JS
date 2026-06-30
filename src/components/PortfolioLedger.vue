<script setup>
import { ref, nextTick } from 'vue'

defineProps({
  netWorth: {
    type: Array,
    required: true
  }
})

// Define the custom event to notify the parent component
defineEmits(['delete-asset'])

const activeCell = ref({ id: null, field: null })
const editBuffer = ref(0)

async function startEdit(asset, field) {
  activeCell.value = { id: asset.id, field }
  editBuffer.value = asset[field]
  
  await nextTick()
  const inputEl = document.querySelector(`.editing-${asset.id}-${field}`)
  if (inputEl) inputEl.focus()
}

function saveAndStopEdit(asset, field) {
  asset[field] = editBuffer.value
  activeCell.value = { id: null, field: null }
}

function cancelEdit() {
  activeCell.value = { id: null, field: null }
}
</script>

<template>
  <div class="card ledger-card">
    <h2>Current Portfolio</h2>
    <table class="portfolio-table">
      <thead>
        <tr>
          <th>Account Type</th>
          <th class="text-right">Principal</th>
          <th class="text-right">Annual Contribution</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="asset in netWorth" :key="asset.id">
          <td class="asset-type-cell clickable-cell" @click="startEdit(asset, 'typeLabel')">
            <div class="asset-label-wrapper">
              <div v-if="activeCell.id === asset.id && activeCell.field === 'typeLabel'" class="input-wrapper type-input-wrapper" @click.stop>
                <input 
                  type="text" 
                  v-model="editBuffer" 
                  :class="['table-input type-input', `editing-${asset.id}-typeLabel`]"
                  @blur="saveAndStopEdit(asset, 'typeLabel')"
                  @keydown.enter="saveAndStopEdit(asset, 'typeLabel')"
                  @keydown.escape="cancelEdit"
                />
              </div>
              <span v-else class="asset-label">{{ asset.typeLabel }}</span>
            </div>

            <button class="btn-delete" @click.stop="$emit('delete-asset', asset.id)" title="Delete Asset">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="trash-icon">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </td>
          
          <td class="text-right clickable-cell" @click="startEdit(asset, 'principal')">
            <div v-if="activeCell.id === asset.id && activeCell.field === 'principal'" class="input-wrapper">
              <span class="currency-symbol">£</span>
              <input 
                type="number" 
                v-model.number="editBuffer" 
                inputmode="decimal"
                :class="['table-input text-right', `editing-${asset.id}-principal`]"
                @blur="saveAndStopEdit(asset, 'principal')"
                @keydown.enter="saveAndStopEdit(asset, 'principal')"
                @keydown.escape="cancelEdit"
              />
            </div>
            <span v-else>
              £{{ asset.principal ? asset.principal.toLocaleString() : '0' }}
            </span>
          </td>
          
          <td class="text-right clickable-cell" @click="startEdit(asset, 'contribution')">
            <div v-if="activeCell.id === asset.id && activeCell.field === 'contribution'" class="input-wrapper">
              <span class="currency-symbol">£</span>
              <input 
                type="number" 
                v-model.number="editBuffer" 
                inputmode="decimal"
                :class="['table-input text-right', `editing-${asset.id}-contribution`]"
                @blur="saveAndStopEdit(asset, 'contribution')"
                @keydown.enter="saveAndStopEdit(asset, 'contribution')"
                @keydown.escape="cancelEdit"
              />
            </div>
            <span v-else>
              £{{ asset.contribution ? asset.contribution.toLocaleString() : '0' }}
            </span>
          </td>
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
.portfolio-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; height: 44px; }
.text-right { text-align: right !important; }

.asset-type-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-right: 8px !important;
}

.asset-label-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.asset-label {
  display: inline-block;
}

.btn-delete {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  border-radius: 4px;
  transition: color 0.2s, background-color 0.2s;
}

.btn-delete:hover,
.btn-delete:active {
  color: #ef4444;
  background-color: #fee2e2;
}

.clickable-cell {
  cursor: pointer;
  transition: background-color 0.15s;
}
.clickable-cell:hover {
  background-color: #f8fafc;
}

.input-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

/* Forces the account name text box to stay shifted left */
.type-input-wrapper {
  justify-content: flex-start !important;
}

.currency-symbol {
  color: #0f172a;
  margin-right: 2px;
}

.table-input {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  padding: 4px 6px;
  border-radius: 4px;
  width: 100px;
  display: inline-block;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

.table-input.type-input {
  width: 100%;
  max-width: 160px;
  text-align: left;
}

.table-input:focus {
  border-color: #3b82f6;
}

.table-input::-webkit-outer-spin-button,
.table-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.table-input {
  appearance: textfield;
}
</style>