<template>
  <div class="pie-chart-3d" ref="chartDom" />
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts/core';
import 'echarts-gl'; // ✅ 目前未启用真实 3D，但保留以备扩展
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const chartDom = ref(null);
    let chartInstance = null;

    const renderChart = () => {
      if (!chartDom.value) return;
      if (!chartInstance) {
        chartInstance = echarts.init(chartDom.value);
      }

      const { improved = 0, declined = 0, unchanged = 0 } = props.data;
      const total = improved + declined + unchanged;

      const data = [
        { name: '进步人数', value: improved, color: '#67C23A' },
        { name: '退步人数', value: declined, color: '#F56C6C' },
        { name: '保持稳定', value: unchanged, color: '#E6A23C' }
      ];

      const option = {
        backgroundColor: '#fff',
        tooltip: {
          trigger: 'item',
          formatter: ({ name, value }) => {
            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${name}<br/>人数：${value} 人<br/>占比：${percent}%`;
          }
        },
        legend: {
          bottom: 0,
          itemWidth: 14,
          itemHeight: 10,
          icon: 'circle',
          textStyle: { fontSize: 13 },
          data: data.map(d => d.name)
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '65%'],
            roseType: 'radius',
            startAngle: 90,
            avoidLabelOverlap: true,
            label: {
              show: true,
              formatter: '{b}\n{d}%',
              fontSize: 14,
              color: '#333'
            },
            labelLine: {
              length: 16,
              length2: 10,
              smooth: true
            },
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.15)'
            },
            emphasis: {
              scale: true,
              scaleSize: 8,
              itemStyle: {
                shadowBlur: 40,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              },
              label: {
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: data.map(item => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: item.color }
            }))
          }
        ]
      };

      chartInstance.setOption(option);
    };

    onMounted(renderChart);
    watch(() => props.data, renderChart, { deep: true });

    return {
      chartDom
    };
  }
};
</script>

<style scoped>
.pie-chart-3d {
  width: 100%;
  height: 500px;
  margin: 20px auto;
}
</style>