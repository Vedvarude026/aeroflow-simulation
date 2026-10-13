import { ForecastModelMetrics } from '../types/index.js';

export function generate24MonthHistory(seed: number = 42) {
  let rng = seed;
  const rand = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };

  const daysTotal = 730; // ~24 months
  const history: { day: number; date: string; flightHours: number; unserviceableCount: number; demandBaseA: number }[] = [];
  const startDate = new Date('2022-05-10');

  for (let i = 0; i < daysTotal; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Weekly seasonality + noise + subtle linear trend
    const dayOfWeek = currentDate.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.1;
    const seasonalTrend = Math.sin((i / 365) * Math.PI * 2) * 4;
    const flightHours = Math.max(5, Math.floor(22 + seasonalTrend * weekendFactor + (i / 100) + (rand() - 0.5) * 8));
    const unserviceableCount = Math.max(0, Math.floor(1 + (flightHours / 15) * rand() * 1.5));
    const demandBaseA = Math.max(2, Math.floor(flightHours * 0.45 + (rand() - 0.5) * 5));

    history.push({
      day: i,
      date: dateStr,
      flightHours,
      unserviceableCount,
      demandBaseA
    });
  }

  return history;
}

export function runForecastingModels(seed: number = 42) {
  const data = generate24MonthHistory(seed);
  const n = data.length;
  const testSize = Math.floor(n * 0.2); // last 20% held out
  const trainSize = n - testSize;

  const trainData = data.slice(0, trainSize);
  const testData = data.slice(trainSize);

  // Target variable: unserviceableCount
  const actuals = testData.map(d => d.unserviceableCount);

  // 1. 7-Day Moving Average
  const ma7Preds: number[] = [];
  for (let i = 0; i < testData.length; i++) {
    const historicalSlice = i < 7 
      ? [...trainData.slice(trainData.length - (7 - i)), ...testData.slice(0, i)]
      : testData.slice(i - 7, i);
    const sum = historicalSlice.reduce((acc, curr) => acc + curr.unserviceableCount, 0);
    ma7Preds.push(sum / historicalSlice.length);
  }

  // 2. 14-Day Moving Average
  const ma14Preds: number[] = [];
  for (let i = 0; i < testData.length; i++) {
    const historicalSlice = i < 14
      ? [...trainData.slice(trainData.length - (14 - i)), ...testData.slice(0, i)]
      : testData.slice(i - 14, i);
    const sum = historicalSlice.reduce((acc, curr) => acc + curr.unserviceableCount, 0);
    ma14Preds.push(sum / historicalSlice.length);
  }

  // 3. Exponential Smoothing (alpha = 0.3)
  const expPreds: number[] = [];
  let lastExp = trainData[trainData.length - 1].unserviceableCount;
  const alpha = 0.3;
  for (let i = 0; i < testData.length; i++) {
    expPreds.push(lastExp);
    lastExp = alpha * actuals[i] + (1 - alpha) * lastExp;
  }

  // 4. Linear Regression (features: flightHours, day index)
  // Compute linear model params y = b0 + b1 * flightHours + b2 * day
  let sumX1 = 0, sumX2 = 0, sumY = 0, sumX1Y = 0, sumX2Y = 0, sumX1X1 = 0;
  for (const row of trainData) {
    sumX1 += row.flightHours;
    sumX2 += row.day;
    sumY += row.unserviceableCount;
    sumX1Y += row.flightHours * row.unserviceableCount;
    sumX1X1 += row.flightHours * row.flightHours;
  }
  const meanX1 = sumX1 / trainData.length;
  const meanY = sumY / trainData.length;
  const b1 = (sumX1Y - trainData.length * meanX1 * meanY) / (sumX1X1 - trainData.length * meanX1 * meanX1 || 1);
  const b0 = meanY - b1 * meanX1;

  const lrPreds = testData.map(d => Math.max(0, b0 + b1 * d.flightHours));

  // Compute metrics helper
  const calcMetrics = (preds: number[]) => {
    let mae = 0;
    let mse = 0;
    let mapeSum = 0;
    let count = 0;

    for (let i = 0; i < actuals.length; i++) {
      const act = actuals[i];
      const prd = preds[i];
      const err = Math.abs(act - prd);
      mae += err;
      mse += err * err;
      if (act > 0) {
        mapeSum += (err / act);
        count++;
      }
    }
    const maeVal = mae / actuals.length;
    const rmseVal = Math.sqrt(mse / actuals.length);
    const mapeVal = (mapeSum / (count || 1)) * 100;
    return { mae: maeVal, rmse: rmseVal, mape: mapeVal };
  };

  const models = [
    { name: 'Linear Regression (Feature-based)', preds: lrPreds },
    { name: 'Exponential Smoothing (α=0.3)', preds: expPreds },
    { name: '14-Day Moving Average', preds: ma14Preds },
    { name: '7-Day Moving Average', preds: ma7Preds }
  ];

  const results: ForecastModelMetrics[] = models.map(m => {
    const { mae, rmse, mape } = calcMetrics(m.preds);
    
    // Residual standard deviation for 80% & 95% intervals (1.28 and 1.96 z-scores)
    const stdErr = rmse;
    const series = testData.slice(0, 30).map((d, i) => {
      const predicted = Number(m.preds[i].toFixed(2));
      return {
        date: d.date,
        actual: d.unserviceableCount,
        predicted,
        lower80: Math.max(0, Number((predicted - 1.28 * stdErr).toFixed(2))),
        upper80: Number((predicted + 1.28 * stdErr).toFixed(2)),
        lower95: Math.max(0, Number((predicted - 1.96 * stdErr).toFixed(2))),
        upper95: Number((predicted + 1.96 * stdErr).toFixed(2))
      };
    });

    return {
      modelName: m.name,
      mae: Number(mae.toFixed(2)),
      rmse: Number(rmse.toFixed(2)),
      mape: Number(mape.toFixed(1)),
      series
    };
  });

  return results;
}
