// Utility function to sanitize formatted string values (e.g., "£10,000") into pure numbers
export const clean = (val) => Number(String(val).replace(/[£,]/g, ''));

/**
 * Calculates the current total baseline net worth.
 * @param {Array} net_worth - Array of asset objects.
 * @returns {Number} Total baseline principal sum.
 */
export const balance = (net_worth) => {
  let current = 0;
  if (!net_worth || net_worth.length === 0) return current;

  for (let x = 0; x < net_worth.length; x++) {
    current += clean(net_worth[x]['principal'] || 0);
  }
  
  return current;
}

/**
 * Projects the annual growth of a net worth portfolio, generating a year-by-year 
 * snapshot AND pre-calculated SVG paths/gridlines within a dynamic range window.
 * @param {Array} net_worth - Array of asset objects containing principal, contribution, years, and flag.
 * @returns {Object} Object containing timeline raw data, SVG line path coordinates, grid axes, and boundaries.
 */
export const growth = (net_worth) => {
  if (!net_worth || net_worth.length === 0) {
    return {
      timeline: [],
      paths: { low: "", average: "", high: "" },
      points: { low: [], average: [], high: [] },
      gridLines: [],
      xLabels: [],
      viewBox: "0 0 600 300"
    };
  }

  // Find the absolute maximum timeline horizon across all assets
  const maxYears = Math.max(...net_worth.map(asset => Number(asset.years) || 0), 0);
  const timeline = [];

  /**
   * Helper function to calculate compounding value of a single asset at a specific timeline year.
   * Handles the transition from active phase (contributing) to passive phase (compounding only).
   */
  const calculateAssetValue = (currentYear, rate, principal, contribution, activeYears) => {
    if (currentYear === 0) {
      return principal;
    }

    if (currentYear <= activeYears) {
      // --- ACTIVE PHASE ---
      const compoundPrincipal = principal * (rate ** currentYear);
      const compoundSeries = contribution * ((rate ** currentYear - 1) / (rate - 1));
      return compoundPrincipal + compoundSeries;
    } else {
      // --- PASSIVE PHASE (currentYear > activeYears) ---
      const valueAtEndActive = (principal * (rate ** activeYears)) + 
                               (contribution * ((rate ** activeYears - 1) / (rate - 1)));
      const passiveYears = currentYear - activeYears;
      return valueAtEndActive * (rate ** passiveYears);
    }
  };

  // 1. Generate annual snapshots from Year 0 to maxYears
  for (let y = 0; y <= maxYears; y++) {
    let low_total = 0;
    let total = 0;
    let high_total = 0;

    for (let x = 0; x < net_worth.length; x++) {
      const p = clean(net_worth[x]['principal'] || 0);
      const c = clean(net_worth[x]['contribution'] || 0);
      const t = Number(net_worth[x]['years']) || 0;
      const flag = net_worth[x]['flag'];

      if (flag === 'i') {
        // Investment tracks: 6% (low), 8% (avg), and 10% (high)
        low_total += calculateAssetValue(y, 1.06, p, c, t);
        total += calculateAssetValue(y, 1.08, p, c, t);
        high_total += calculateAssetValue(y, 1.10, p, c, t);
      } else {
        // Cash assets grow at a flat 3% across all three tracks
        const cashValue = calculateAssetValue(y, 1.03, p, c, t);
        low_total += cashValue;
        total += cashValue;
        high_total += cashValue;
      }
    }

    // Capture the snapshot for the current year
    timeline.push({
      year: y,
      low: Math.round(low_total),
      average: Math.round(total),
      high: Math.round(high_total)
    });
  }

  // 2. Extract localized data boundaries (both Floor and Ceiling)
  const rawMinVal = Math.min(...timeline.map(t => Math.min(t.low, t.average, t.high)));
  const rawMaxVal = Math.max(...timeline.map(t => Math.max(t.low, t.average, t.high)), 1);
  const dataSpan = rawMaxVal - rawMinVal || 1;

  // Nice-step generation based on the mathematical Order of Magnitude
  const gridSteps = 4;
  const rawStep = dataSpan / gridSteps;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;

  // Map the normalized fractional values to clean base steps
  let stepFactor;
  if (normalized <= 1) stepFactor = 1;
  else if (normalized <= 2) stepFactor = 2;
  else if (normalized <= 2.5) stepFactor = 2.5;
  else if (normalized <= 5) stepFactor = 5;
  else stepFactor = 10;

  const stepSize = stepFactor * magnitude;

  // Floor the graph range to a clean multiple of our stepSize
  let minVal = Math.floor(rawMinVal / stepSize) * stepSize;
  if (minVal < 0) minVal = 0; // Prevent running into negative balances unless debt exists

  // Ceiling the graph range out cleanly to fit our grid distributions evenly
  let maxVal = Math.ceil(rawMaxVal / stepSize) * stepSize;
  let currentRange = maxVal - minVal;
  
  // Ensure the vertical range subdivides perfectly by our grid step loops
  const targetStep = stepSize * gridSteps;
  while (currentRange % targetStep !== 0 || maxVal < rawMaxVal) {
    maxVal += stepSize;
    currentRange = maxVal - minVal;
  }

  const width = 600;
  const height = 300;
  const paddingLeft = 70;   // Space for Y-axis currency text labels
  const paddingRight = 35;  // Gap at the right edge
  const paddingTop = 30;    // Gap at the top
  const paddingBottom = 40; // Space for X-axis timeline tags

  // Coordinate helpers to map values into localized window boundaries
  const getX = (year) => {
    if (maxYears === 0) return paddingLeft;
    return paddingLeft + (year / maxYears) * (width - paddingLeft - paddingRight);
  };

  const getY = (val) => {
    const range = maxVal - minVal || 1;
    return height - paddingBottom - ((val - minVal) / range) * (height - paddingTop - paddingBottom);
  };

  // Compile coordinate loops into string paths for drawing SVG elements
  let lowPath = "";
  let averagePath = "";
  let highPath = "";

  const points = { low: [], average: [], high: [] };

  timeline.forEach((pt, index) => {
    const x = getX(pt.year).toFixed(1);
    const yLow = getY(pt.low).toFixed(1);
    const yAvg = getY(pt.average).toFixed(1);
    const yHigh = getY(pt.high).toFixed(1);

    if (index === 0) {
      lowPath = `M ${x} ${yLow}`;
      averagePath = `M ${x} ${yAvg}`;
      highPath = `M ${x} ${yHigh}`;
    } else {
      lowPath += ` L ${x} ${yLow}`;
      averagePath += ` L ${x} ${yAvg}`;
      highPath += ` L ${x} ${yHigh}`;
    }

    // Capture precise points for coordinate point intersections
    points.low.push({ x, y: yLow, value: pt.low, year: pt.year });
    points.average.push({ x, y: yAvg, value: pt.average, year: pt.year });
    points.high.push({ x, y: yHigh, value: pt.high, year: pt.year });
  });

  // Calculate gridline rows distributed across the updated localized range
  const gridLines = [];
  for (let i = 0; i <= gridSteps; i++) {
    const currentRowValue = minVal + (currentRange / gridSteps) * i;
    const yCoord = getY(currentRowValue).toFixed(1);
    gridLines.push({
      y: yCoord,
      label: `£${Math.round(currentRowValue).toLocaleString()}`
    });
  }

  // Calculate horizontal axis interval indicators
  const xLabels = [];
  const xLabelStep = Math.max(1, Math.ceil(maxYears / 6)); 
  for (let y = 0; y <= maxYears; y += xLabelStep) {
    xLabels.push({
      x: getX(y).toFixed(1),
      label: `Yr ${y}`
    });
  }

  return {
    timeline,
    paths: {
      low: lowPath,
      average: averagePath,
      high: highPath
    },
    points,
    gridLines,
    xLabels,
    viewBox: `0 0 ${width} ${height}`
  };
};