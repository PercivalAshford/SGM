<template>
    <div class="chart-container">
      <div class="checkbox-group">
        <label v-for="subject in subjects" :key="subject.value">
          <input type="checkbox" v-model="selectedSubjects" :value="subject.value" />
          {{ subject.label }}
        </label>
      </div>
  
      <canvas ref="comparisonChart"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, watch, onMounted } from 'vue';
  import Chart from 'chart.js/auto';
  
  export default {
    props: {
      studentScores: {
        type: Array,
        required: true
      },
      averageScores: {
        type: Array,
        required: true
      }
    },
    setup(props) {
      const comparisonChart = ref(null);
      let chartInstance = null;
  
      const subjects = [
        { label: '语文', value: 'chinese' },
        { label: '数学', value: 'math' },
        { label: '英语', value: 'english' },
        { label: '物理', value: 'physics' },
        { label: '化学', value: 'chemistry' },
        { label: '生物', value: 'biology' }
      ];
  
      const selectedSubjects = ref(subjects.map(s => s.value)); // 默认全选
  
      const getLabel = (subject) => {
        return subjects.find(s => s.value === subject)?.label || subject;
      };
  
      const renderChart = () => {
        if (chartInstance) chartInstance.destroy();
  
        const labels = props.studentScores.map(s => s.exam_date);
  
        const datasets = [];
  
        selectedSubjects.value.forEach(subject => {
          datasets.push({
            label: `学生 ${getLabel(subject)}`,
            data: props.studentScores.map(s => s[subject]),
            borderColor: getColor(subject),
            borderWidth: 2,
            fill: false,
            tension: 0.3
          });
  
          datasets.push({
            label: `班级 ${getLabel(subject)}平均`,
            data: props.averageScores.map(a => a[subject + '_avg']),
            borderColor: getColor(subject, true),
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.3
          });
        });
  
        chartInstance = new Chart(comparisonChart.value, {
          type: 'line',
          data: { labels, datasets },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              tooltip: { mode: 'index', intersect: false },
              datalabels: {
    display: false // 显式关闭 data label 显示
  }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            scales: {
              y: {
                title: { display: true, text: '成绩' },
                suggestedMin: 0,
                suggestedMax: 150
              }
            }
          }
        });
      };
  
      const getColor = (subject, isAverage = false) => {
        const baseColors = {
          chinese: '#409EFF',
          math: '#E67C73',
          english: '#67C23A',
          physics: '#9B59B6',
          chemistry: '#E6A23C',
          biology: '#5DADE2'
        };
        return isAverage ? baseColors[subject] + '80' : baseColors[subject];
      };
  
      watch(() => props.studentScores, renderChart, { deep: true });
      watch(() => props.averageScores, renderChart, { deep: true });
      watch(selectedSubjects, renderChart, { deep: true });
  
      onMounted(renderChart);
  
      return {
        comparisonChart,
        selectedSubjects,
        subjects
      };
    }
  };
  </script>
  
  <style scoped>
  .chart-container {
    max-width: 900px;
    margin: 30px auto;
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 10px;
    justify-content: center;
  }
  
  .checkbox-group label {
    font-size: 14px;
    user-select: none;
  }
  </style>