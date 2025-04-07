<template>
    <div class="distribution-container">
      <canvas ref="barChart"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';
  
  export default {
    props: {
      data: {
        type: Array,
        required: true
      }
    },
    setup(props) {
      const barChart = ref(null);
      let chartInstance = null;
  
      const subjectLabels = ['语文', '数学', '英语', '物理', '化学', '生物'];
      const subjectKeys = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];
  
      const getCounts = (type) => {
        return subjectKeys.map((subject) => {
          const count = props.data.filter(item => item.subject === subject && item.change === type).length;
          return count;
        });
      };
  
      const renderChart = () => {
        if (chartInstance) chartInstance.destroy();
  
        chartInstance = new Chart(barChart.value, {
          type: 'bar',
          data: {
            labels: subjectLabels,
            datasets: [
              {
                label: '进步',
                data: getCounts('improved'),
                backgroundColor: '#67C23A'
              },
              {
                label: '退步',
                data: getCounts('declined'),
                backgroundColor: '#F56C6C'
              },
              {
                label: '稳定',
                data: getCounts('unchanged'),
                backgroundColor: '#909399'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              x: {
                stacked: true,
                title: { display: true, text: '科目' }
              },
              y: {
                stacked: true,
                beginAtZero: true,
                title: { display: true, text: '人数' }
              }
            }
          }
        });
      };
  
      watch(() => props.data, renderChart, { deep: true });
      onMounted(renderChart);
  
      return {
        barChart
      };
    }
  };
  </script>
  
  <style scoped>
  .distribution-container {
    max-width: 900px;
    margin: 40px auto;
  }
  </style>