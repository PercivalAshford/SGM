<template>
    <div class="chart-container">
      <div class="header">
      </div>
  
      <div class="chart-wrapper">
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import axios from "axios";
  import * as echarts from "echarts";
  import { use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent, DataZoomComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import VChart from "vue-echarts";
  
  use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent, DataZoomComponent, BarChart, CanvasRenderer]);
  
  export default {
    components: { VChart },
    setup() {
      const chartOption = ref({});
  
      const fetchData = async () => {
        try {
          const response = await axios.get("http://localhost:3000/api/exams/score-distribution");
          const data = response.data;
  
          // ✅ 转换 YYYYMMDD 格式为 "YYYY年MM月DD日"
          const formatDate = (dateStr) => {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}年${month}月${day}日`;
          };
  
          const examDates = data.map((entry) => formatDate(entry.exam_date));
  
          const scoreRanges = [
            "90以上", "85-89", "80-84", "75-79", "70-74", "65-69", "60-64", "不及格"
          ];
          const colors = [
            ["#4CAF50", "#2E7D32"],
            ["#FFEB3B", "#F9A825"],
            ["#FF9800", "#E65100"],
            ["#E91E63", "#C2185B"],
            ["#2196F3", "#1976D2"],
            ["#673AB7", "#512DA8"],
            ["#009688", "#00796B"],
            ["#F44336", "#D32F2F"]
          ];
  
          const seriesData = scoreRanges.map((range, index) => ({
            name: range,
            type: "bar",
            stack: "total",
            data: data.map((entry) => entry[range] ?? 0),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[index][0] },
                { offset: 1, color: colors[index][1] }
              ])
            },
            emphasis: { focus: "series" }
          }));
  
          chartOption.value = {
            title: { text: "历次考试分数段分布", left: "center" },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
              formatter: (params) => {
                let result = `<strong>${params[0].axisValue}</strong><br/>`;
                params.forEach((item) => {
                  result += `${item.marker} ${item.seriesName}: <strong>${item.value}</strong> 人<br/>`;
                });
                return result;
              },
            },
            legend: {
              top: 30,
              data: scoreRanges,
              textStyle: { fontSize: 12 }
            },
            xAxis: {
              type: "category",
              data: examDates,
              axisLabel: { rotate: 25, fontSize: 12, fontWeight: "bold", color: "#333" }
            },
            yAxis: {
              type: "value",
              axisLabel: { formatter: "{value} 人", fontSize: 12, fontWeight: "bold" }
            },
            toolbox: {
              feature: { dataZoom: { yAxisIndex: "none" }, restore: {}, saveAsImage: {} },
            },
            dataZoom: [
              { type: "slider", show: true, start: 0, end: 100, xAxisIndex: 0, height: 12 },
              { type: "inside", xAxisIndex: 0 }
            ],
            grid: {
              left: "8%",
              right: "8%",
              bottom: "12%",
              containLabel: true
            },
            series: seriesData,
            animationDuration: 1000,
            animationEasing: "cubicOut"
          };
        } catch (error) {
          console.error("获取数据失败:", error);
        }
      };
  
      onMounted(fetchData);
  
      return { chartOption };
    },
  };
  </script>
  
  <style scoped>
  /* ✅ 让整个组件不再有卡片样式 */
  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px;
  }
  
  /* ✅ 取消卡片效果 */
  .chart-container {
    background: none; /* 去掉背景 */
    border-radius: 0; /* 去掉圆角 */
    box-shadow: none; /* 去掉阴影 */
  }
  
  /* ✅ 让标题更简洁 */
  .header {
    width: 100%;
    text-align: center;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 24px;
    color: #333;
    font-weight: bold;
  }
  
  .description {
    font-size: 14px;
    color: #666;
  }
  
  /* ✅ 让图表区域更紧凑 */
  .chart-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 1000px;
  }
  
  /* ✅ 让 v-chart 也完全居中 */
  .chart {
    width: 100%;
    height: 500px;
    background: none; /* 取消背景 */
    border-radius: 0; /* 取消圆角 */
    padding: 0; /* 取消内边距 */
  }
  
  /* ✅ 让滑动缩放条不占太多空间 */
  .dataZoom {
    background-color: rgba(0, 0, 0, 0.05);
    height: 12px;
  }
  </style>