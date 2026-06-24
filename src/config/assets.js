export const assetHierarchy = {
  'ISA': [
    { id: '4', label: 'Cash' }, 
    { id: '1', label: 'Stocks & Shares' }
  ],
  'LISA': [
    { id: '5', label: 'Cash' },
    { id: '6', label: 'Stocks & Shares' }
  ],
  'Pension': [
    { id: '2', label: 'Workplace (DC)' },
    { id: '3', label: 'SIPP' },
    { id: '9', label: 'Defined Benefit' }
  ],
  'Savings/Investments': [
    { id: '7', label: 'Cash Savings' },
    { id: '8', label: 'General Investment Account (GIA)' }
  ],
  'Property': [
    { id: '10', label: 'Property Equity' }
  ]
}

export const assetDescriptions = {
  'ISA': 'Tax-free gains on savings and investments on contributions up to £20,000 per tax year.',
  'LISA': 'A specific type of ISA (Lifetime ISA) with a 25% government bonus. Used for buying your first home or to be used as a pension as it\'s withdrawable post-60 with no penalty. Maximum allowed contribution of £4,000 and is part of the overall £20,000 ISA allowance.',
  'Pension': 'Contributed to as a tax-efficient way to set aside funds for later life or retirement.',
  'Savings/Investments': 'Standard taxable cash accounts and general investments that are NOT wrapped in an ISA',
  'Property': 'Properties are investments whether intentionally or not and count towards net worth. Should disregard the portion of the property that remains to be on a mortgage for an accurate figure.'
}

export const specificDescriptions = {
  'ISA': 'Tax-free gains on savings and investments on contributions up to £20,000 per tax year.',
  'LISA': 'A specific type of ISA (Lifetime ISA) with a 25% government bonus. Used for buying your first home or to be used as a pension as it\'s withdrawable post-60 with no penalty. Maximum allowed contribution of £4,000 and is part of the overall £20,000 ISA allowance.',
  'Pension': 'Contributed to as a tax-efficient way to set aside funds for later life or retirement.',
  'Savings/Investments': 'Standard taxable cash accounts and general investments that are NOT wrapped in an ISA',
  'Property': 'Properties are investments whether intentionally or not and count towards net worth. Should disregard the portion of the property that remains to be on a mortgage for an accurate figure.'
}

export const getAccountName = (type) => {
  const types = { 
    '1': 'Stocks & Shares ISA', 
    '2': 'Workplace Pension', 
    '3': 'SIPP', 
    '4': 'Cash ISA', 
    '5': 'Cash LISA',
    '6': 'Stocks & Shares LISA',
    '7': 'Cash Savings',
    '8': 'General Investment Account',
    '9': 'Defined Benefit Pension',
    '10': 'Property Equity'
  }
  return types[type] || 'Unknown'
}

export const getAssetClass = (type) => {
  const classes = {
    '1': 'Stocks & Shares',
    '2': 'Pensions',
    '3': 'Pensions',
    '4': 'Cash',
    '5': 'Cash',
    '6': 'Stocks & Shares',
    '7': 'Cash',
    '8': 'Stocks & Shares',
    '9': 'Pensions',
    '10': 'Property'
  }
  return classes[type] || 'Other'
}
