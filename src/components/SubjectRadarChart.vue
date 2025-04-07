<template>
  <div class="radar-container">
    <canvas ref="radarChart"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

export default {
  props: {
    studentAverages: {
      type: Object,
      required: true
    },
    classAverages: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const radarChart = ref(null);
    let chartInstance = null;

    const subjects = [
      { label: '语文', key: 'chinese' },
      { label: '数学', key: 'math' },
      { label: '英语', key: 'english' },
      { label: '物理', key: 'physics' },
      { label: '化学', key: 'chemistry' },
      { label: '生物', key: 'biology' }
    ];

    const renderChart = () => {
      if (chartInstance) chartInstance.destroy();

      const labels = subjects.map(s => s.label);
      const studentData = subjects.map(s =>
        Math.round(props.studentAverages?.[s.key] ?? 0)
      );
      const classData = subjects.map(s =>
        Math.round(props.classAverages?.[s.key + '_avg'] ?? 0)
      );

      console.log('📊 渲染雷达图数据:', { studentData, classData });

      chartInstance = new Chart(radarChart.value, {
        type: 'radar',
        data: {
          labels,
          datasets: [
            {
              label: '该生平均分',
              data: studentData,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            },
            {
              label: '班级平均分',
              data: classData,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              pointBackgroundColor: 'rgba(255, 99, 132, 1)'
            }
          ]
        },
        options: {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      enabled: true
    },
    datalabels: {
      display: false  // ✅ 确保不显示数据标签
    }
  },
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 150,
      ticks: {
        stepSize: 30,
        callback: function (value) {
          return Number.isInteger(value) ? value : '';
        }
      },
      pointLabels: {
        font: {
          size: 14
        }
      }
    }
  }
}
      });
    };

    watch(() => props.studentAverages, renderChart, { deep: true });
    watch(() => props.classAverages, renderChart, { deep: true });
    onMounted(renderChart);

    return { radarChart };
  }
};
</script>

<style scoped>
.radar-container {
  max-width: 600px;
  height: 500px; /* 必须设置高度才能显示 */
  margin: 30px auto;
}
</style>