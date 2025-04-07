<template>
  <div class="trend-container">
    <canvas ref="trendChart"></canvas>
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
    const trendChart = ref(null);
    const chartInstance = ref(null);

    const subjectLabels = {
      chinese: '语文',
      math: '数学',
      english: '英语',
      physics: '物理',
      chemistry: '化学',
      biology: '生物'
    };

    const colors = {
      chinese: '#409EFF',
      math: '#E67C73',
      english: '#67C23A',
      physics: '#9B59B6',
      chemistry: '#E6A23C',
      biology: '#5DADE2'
    };

    const renderChart = () => {
      const labels = props.data.map(item => item.exam_date);
      const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];

      const datasets = subjects.map(subject => ({
        label: subjectLabels[subject],
        data: props.data.map(item => item[subject]),
        borderColor: colors[subject],
        backgroundColor: colors[subject] + '33',
        tension: 0.3,
        fill: false
      }));

      if (chartInstance.value) chartInstance.value.destroy();

      chartInstance.value = new Chart(trendChart.value, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: '平均成绩' }
            },
            x: {
              title: { display: true, text: '考试日期' }
            }
          }
        }
      });
    };

    onMounted(renderChart);
    watch(() => props.data, renderChart, { deep: true });

    return { trendChart };
  }
};
</script>

<style scoped>
.trend-container {
  max-width: 1000px;
  margin: 30px auto;
}
</style>