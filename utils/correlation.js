// utils/correlation.js

// 计算 Pearson 相关系数
function pearsonCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0; // 避免除 0 错误

    const sumX = x.reduce((acc, val) => acc + val, 0);
    const sumY = y.reduce((acc, val) => acc + val, 0);
    const sumXY = x.map((val, i) => val * y[i]).reduce((acc, val) => acc + val, 0);
    const sumX2 = x.map(val => val * val).reduce((acc, val) => acc + val, 0);
    const sumY2 = y.map(val => val * val).reduce((acc, val) => acc + val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return (denominator === 0) ? 0 : (numerator / denominator);
}

// 计算相关矩阵
function computeCorrelationMatrix(data) {
    const subjects = ["chinese", "math", "english", "physics", "chemistry", "biology", "total_score"];
    const correlationMatrix = {};

    for (let subject1 of subjects) {
        correlationMatrix[subject1] = {};
        for (let subject2 of subjects) {
            const values1 = data.map(row => row[subject1] || 0); // 处理 undefined
            const values2 = data.map(row => row[subject2] || 0);
            correlationMatrix[subject1][subject2] = pearsonCorrelation(values1, values2).toFixed(2);
        }
    }
    return correlationMatrix;
}

export { computeCorrelationMatrix };