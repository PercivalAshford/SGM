<template>
    <div class="risk-analysis-container">
      <h3 class="title">预测成绩 vs 前三次平均成绩 对比</h3>
  
      <div ref="chartRef" class="chart"></div>
  
      <div class="risk-list">
        <div v-for="item in riskList" :key="item.subject" class="risk-item">
          <span class="subject">{{ subjectMap[item.subject] }}</span>
          <span :class="['difference', item.diff < -5 ? 'low' : item.diff > 5 ? 'high' : 'normal']">
            {{ item.diff > 0 ? '+' : '' }}{{ item.diff }} 分
          </span>
          <span class="icon" v-if="item.diff < -20">警告</span>
          <span class="icon" v-else-if="item.diff > 5">未见异常</span>
          <span class="icon" v-else>未见异常</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import * as echarts from 'echarts';
  import { onMounted, ref, watch, nextTick } from 'vue';
  
  export default {
    props: {
      predicted: Object,
      averages: Object
    },
    setup(props) {
      const chartRef = ref(null);
      const chartInstance = ref(null);
  
      const subjectMap = {
        chinese: '语文',
        math: '数学',
        english: '英语',
        physics: '物理',
        chemistry: '化学',
        biology: '生物'
      };
  
      const subjects = Object.keys(subjectMap);
      const riskList = ref([]);
  
      const computeRisk = () => {
        riskList.value = subjects.map(subject => {
          const pred = Math.round(props.predicted[subject] || 0);
          const avg = Math.round(props.averages[subject] || 0);
          return {
            subject,
            diff: pred - avg
          };
        }).sort((a, b) => a.diff - b.diff);
      };
  
      const renderChart = () => {
        if (!chartRef.value) return;
  
        if (chartInstance.value) {
          chartInstance.value.dispose(); // 销毁旧实例
        }
  
        chartInstance.value = echarts.init(chartRef.value);
        const option = {
          tooltip: {},
          legend: { data: ['预测分', '平均分'] },
          grid: { left: '10%', right: '10%', bottom: '10%', top: '10%' },
          xAxis: {
            type: 'value',
            min: 0,
            max: 150
          },
          yAxis: {
            type: 'category',
            data: subjects.map(s => subjectMap[s])
          },
          series: [
            {
              name: '预测分',
              type: 'bar',
              data: subjects.map(s => Math.round(props.predicted[s] || 0)),
              itemStyle: { color: '#409EFF' }
            },
            {
              name: '平均分',
              type: 'bar',
              data: subjects.map(s => Math.round(props.averages[s] || 0)),
              itemStyle: { color: '#67C23A' }
            }
          ]
        };
        chartInstance.value.setOption(option);
      };
  
      watch(
        () => [props.predicted, props.averages],
        async () => {
          await nextTick();
          renderChart();
          computeRisk();
        },
        { immediate: true }
      );
  
      onMounted(async () => {
        await nextTick();
        renderChart();
        computeRisk();
      });
  
      return {
        chartRef,
        subjectMap,
        riskList
      };
    }
  };
  </script>
  
  <style scoped>
  .risk-analysis-container {
    margin: 20px auto;
    max-width: 900px;
  }
  
  .title {
    font-size: 18px;
    margin-bottom: 12px;
    font-weight: bold;
    color: #333;
    border-left: 4px solid #409EFF;
    padding-left: 8px;
  }
  
  .chart {
    width: 100%;
    height: 400px;
  }
  
  .risk-list {
    margin-top: 20px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  }
  
  .risk-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px dashed #ddd;
    font-size: 14px;
    align-items: center;
  }
  
  .risk-item:last-child {
    border-bottom: none;
  }
  
  .subject {
    font-weight: 500;
    flex: 1;
  }
  
  .difference {
    width: 80px;
    text-align: center;
  }
  
  .difference.low {
    color: #f56c6c;
  }
  
  .difference.high {
    color: #67c23a;
  }
  
  .difference.normal {
    color: #e6a23c;
  }
  
  .icon {
    font-size: 16px;
    margin-left: 10px;
  }
  </style>