<template>
  <div class="chart-container">
    <canvas ref="lineChart"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

export default {
  props: {
    scores: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const lineChart = ref(null);
    let chartInstance = null;

    const renderChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(lineChart.value, {
        type: 'line',
        data: {
          labels: props.scores.map(s => s.exam_date),
          datasets: [
            {
              label: '语文',
              data: props.scores.map(s => s.chinese),
              borderColor: 'blue',
              fill: false,
            },
            {
              label: '数学',
              data: props.scores.map(s => s.math),
              borderColor: 'red',
              fill: false,
            },
            {
              label: '英语',
              data: props.scores.map(s => s.english),
              borderColor: 'green',
              fill: false,
            },
            {
              label: '物理',
              data: props.scores.map(s => s.physics),
              borderColor: 'purple',
              fill: false,
            },
            {
              label: '化学',
              data: props.scores.map(s => s.chemistry),
              borderColor: 'orange',
              fill: false,
            },
            {
              label: '生物',
              data: props.scores.map(s => s.biology),
              borderColor: 'brown',
              fill: false,
            },
            {
              label: '总分',
              data: props.scores.map(s => s.total_score),
              borderColor: 'black',
              fill: false,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true },
            datalabels: { display: false } // 禁止在图上显示数值
          },
          scales: {
            x: {
              title: {
                display: true,
                text: '考试日期',
              },
            },
            y: {
              title: {
                display: true,
                text: '成绩',
              },
              suggestedMin: 0,
              suggestedMax: 750,
            },
          },
        },
      });
    };

    onMounted(renderChart);
    watch(() => props.scores, renderChart, { deep: true });

    return { lineChart };
  },
};
</script>
<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  margin: auto;
}
</style>