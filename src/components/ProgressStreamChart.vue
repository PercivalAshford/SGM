<template>
    <div class="chart-container">
      <h2>学生进步 vs 退步趋势</h2>
      <p class="description">展示学生在历次考试中的进步与退步趋势</p>
    
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
  import { LineChart } from "echarts/charts";
  import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import VChart from "vue-echarts";
  
  use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent, LineChart, CanvasRenderer]);
  
  export default {
    components: { VChart },
    setup() {
      const chartOption = ref({});
  
      const fetchData = async () => {
        try {
          const response = await axios.get("http://localhost:3000/api/exams/progress-trend");
          const data = response.data;
  
          // ✅ 转换 YYYYMMDD 格式为 "YYYY年MM月DD日"
          const formatDate = (dateStr) => {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}年${month}月${day}日`;
          };
  
          const examDates = data.map((entry) => formatDate(entry.exam_date));
  
          const seriesData = [
            {
              name: "进步",
              type: "line",
              stack: "总量",
              smooth: true,
              areaStyle: { opacity: 0.6, color: "green" },
              data: data.map((entry) => entry.improvement_percentage),
            },
            {
              name: "退步",
              type: "line",
              stack: "总量",
              smooth: true,
              areaStyle: { opacity: 0.6, color: "red" },
              data: data.map((entry) => entry.decline_percentage),
            },
            {
              name: "保持",
              type: "line",
              stack: "总量",
              smooth: true,
              areaStyle: { opacity: 0.6, color: "gray" },
              data: data.map((entry) => entry.stable_percentage),
            },
          ];
  
          chartOption.value = {
            title: { text: "进步 vs 退步趋势", left: "center", textStyle: { fontSize: 18, fontWeight: "bold" } },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "cross" },
              backgroundColor: "rgba(50, 50, 50, 0.8)",
              borderRadius: 5,
              textStyle: { color: "#fff" },
              formatter: (params) => {
                let result = `<strong>${params[0].axisValue}</strong><br/>`;
                params.forEach((item) => {
                  result += `${item.marker} ${item.seriesName}: <strong>${item.value.toFixed(2)}%</strong><br/>`;
                });
                return result;
              },
            },
            legend: { top: 20, data: ["进步", "退步", "保持"] },
            xAxis: { type: "category", data: examDates, axisLabel: { rotate: 30 } },
            yAxis: { type: "value", axisLabel: { formatter: "{value} %" } },
            toolbox: { feature: { dataZoom: { yAxisIndex: "none" }, restore: {}, saveAsImage: {} } },
            series: seriesData,
            animationDuration: 1500, // ✅ 增强动画效果
            animationEasing: "cubicOut",
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
  .chart-container {
    text-align: center;
    margin-top: 30px;
  }
  
  h2 {
    font-size: 24px;
    color: #333;
    font-weight: bold;
  }
  
  .description {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
  }
  
  .chart-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 1000px;
  }
  
  .chart {
    width: 100%;
    height: 450px;
  }
  </style>