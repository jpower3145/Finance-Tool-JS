export const clean = (val) => Number(String(val).replace(/[£,]/g, ''));

export const balance = (net_worth) => {
  let current = 0;
  if (!net_worth || net_worth.length === 0) return current;

  for (let x = 0; x < net_worth.length; x++) {
    current += clean(net_worth[x]['principal'] || 0);
  }
  return current;
}

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

  const maxYears = Math.max(...net_worth.map(asset => Number(asset.years) || 0), 0);
  const timeline = [];

  const calculateAssetValue = (currentYear, rate, principal, contribution, activeYears) => {
    if (currentYear === 0) return principal;
    if (currentYear <= activeYears) {
      const compoundPrincipal = principal * (rate ** currentYear);
      const compoundSeries = contribution * ((rate ** currentYear - 1) / (rate - 1));
      return compoundPrincipal + compoundSeries;
    } else {
      const valueAtEndActive = (principal * (rate ** activeYears)) + 
                               (contribution * ((rate ** activeYears - 1) / (rate - 1)));
      const passiveYears = currentYear - activeYears;
      return valueAtEndActive * (rate ** passiveYears);
    }
  };

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
        low_total += calculateAssetValue(y, 1.06, p, c, t);
        total += calculateAssetValue(y, 1.08, p, c, t);
        high_total += calculateAssetValue(y, 1.10, p, c, t);
      } else {
        const cashValue = calculateAssetValue(y, 1.03, p, c, t);
        low_total += cashValue;
        total += cashValue;
        high_total += cashValue;
      }
    }

    timeline.push({
      year: y,
      low: Math.round(low_total),
      average: Math.round(total),
      high: Math.round(high_total)
    });
  }

  const rawMaxVal = Math.max(...timeline.map(t => Math.max(t.low, t.average, t.high)), 1);

  let stepSize = 100000;
  if (rawMaxVal <= 10000) stepSize = 2500;
  else if (rawMaxVal <= 50000) stepSize = 10000;
  else if (rawMaxVal <= 100000) stepSize = 25000;
  else if (rawMaxVal <= 500000) stepSize = 100000;
  else if (rawMaxVal <= 2000000) stepSize = 500000;
  else stepSize = 1000000;

  const gridSteps = 4;
  const maxVal = Math.ceil(rawMaxVal / (stepSize * gridSteps)) * (stepSize * gridSteps) || (stepSize * gridSteps);

  const width = 600;
  const height = 300;
  const paddingLeft = 70;
  const paddingRight = 35;
  const paddingTop = 30;
  const paddingBottom = 40;

  const getX = (year) => maxYears === 0 ? paddingLeft : paddingLeft + (year / maxYears) * (width - paddingLeft - paddingRight);
  const getY = (val) => height - paddingBottom - (val / maxVal) * (height - paddingTop - paddingBottom);

  let lowPath = ""; let averagePath = ""; let highPath = "";
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

    points.low.push({ x, y: yLow, value: pt.low, year: pt.year });
    points.average.push({ x, y: yAvg, value: pt.average, year: pt.year });
    points.high.push({ x, y: yHigh, value: pt.high, year: pt.year });
  });

  const gridLines = [];
  for (let i = 0; i <= gridSteps; i++) {
    const rawVal = (maxVal / gridSteps) * i;
    gridLines.push({ y: getY(rawVal).toFixed(1), label: `£${Math.round(rawVal).toLocaleString()}` });
  }

  const xLabels = [];
  const xLabelStep = Math.max(1, Math.ceil(maxYears / 6));
  for (let y = 0; y <= maxYears; y += xLabelStep) {
    xLabels.push({ x: getX(y).toFixed(1), label: `Yr ${y}` });
  }

  return { timeline, paths: { low: lowPath, average: averagePath, high: highPath }, points, gridLines, xLabels, viewBox: `0 0 ${width} ${height}` };
};
