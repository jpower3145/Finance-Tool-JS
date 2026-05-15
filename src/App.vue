<script setup>
import { ref, computed } from 'vue'
import { clean, growth, balance } from './useCalculator'

const netWorth = ref([])
const newAccount = ref({ type: '1', principal: '', contribution: '' })

// 4. Place the computed property here
// It "watches" netWorth.value and updates whenever the array changes
const results = computed(() => {
  return growth(netWorth.value)
})

const check_bal = computed(() => {
  return balance(netWorth.value)
})

const addAccount = () => {
  const amount = clean(newAccount.value.principal)
  const monthly = clean(newAccount.value.contribution)
  
  // Logic from your switch statement goes here
  let processedCont = monthly * 12
  let flag = 'i'
  
  if (newAccount.value.type === '2') processedCont *= 2
  if (newAccount.value.type === '3') processedCont *= 1.25
  if (newAccount.value.type === '4') flag = 'c'

  netWorth.value.push({
    principal: amount,
    contribution: processedCont,
    years: 10,
    flag: flag
  })

  //Clear the inputs so the user can easily add another account
  newAccount.value.principal = ''
  newAccount.value.contribution = ''

}
</script>

<template>
  <main>
    <h1><b>Financial Calculator</b></h1>
    
    <div>
      <h2>Add Account</h2>
      <select v-model="newAccount.type">
        <option value="1">S&S ISA or GIA</option>
        <option value="2">Workplace Pension</option>
        <option value="3">SIPP</option>
        <option value="4">Cash</option>
      </select>
      
      <input v-model="newAccount.principal" placeholder="Current Amount" />
      <input v-model="newAccount.contribution" placeholder="Monthly Contribution" />
      
      <button @click="addAccount">Add to Portfolio</button>
    </div>
    
    <div>
      <h2>Current Totals</h2>
      <p>Balance: £{{ check_bal?.toLocaleString() }}</p>

      <h2>Projected Totals</h2>
      <p>Pessimistic Projection (6%): £{{ results?.low_total?.toLocaleString() }}</p>
      <p>Average Projection (8%): £{{ results?.total?.toLocaleString() }}</p>
      <p>Optimistic Projection (10%): £{{ results?.high_total?.toLocaleString() }}</p>
    </div>
    
  </main>
</template>

<style scoped>
main {
  font-family: Arial, sans-serif;
  padding: 20px;
}
input, select, button {
  margin-right: 10px;
  padding: 5px;
}
</style>