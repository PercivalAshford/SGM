<template>
    <div class="chart-container">
      <h2>班级最高分 & 最低分趋势</h2>
      <p class="description">观察班级历次考试的最高 & 最低总分变化</p>
      <v-chart class="chart" :option="chartOption" autoresize />
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
          const response = await axios.get("http://localhost:3000/api/exams/highest-lowest-scores");
          const data = response.data;
  
          // ✅ 转换 YYYYMMDD 格式为 "YYYY年MM月DD日"
          const formatDate = (dateStr) => {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}年${month}月${day}日`;
          };
  
          const examDates = data.map((entry) => formatDate(entry.exam_date));
  
          chartOption.value = {
            title: { text: "班级最高分 & 最低分趋势", left: "center" },
            tooltip: {
              trigger: "axis",
              backgroundColor: "rgba(50, 50, 50, 0.8)",
              borderRadius: 5,
              textStyle: { color: "#fff" },
            },
            legend: {
              top: 30,
              data: ["最高分", "最低分"],
            },
            xAxis: {
              type: "category",
              data: examDates,
              axisLabel: { rotate: 45 },
            },
            yAxis: {
              type: "value",
              axisLabel: { formatter: "{value} 分" },
            },
            toolbox: {
              feature: {
                dataZoom: { yAxisIndex: "none" },
                restore: {},
                saveAsImage: {},
              },
            },
            series: [
              {
                name: "最高分",
                type: "line",
                smooth: true,
                data: data.map((entry) => entry.highest_score),
                showSymbol: true,
                symbol: "triangle",
                symbolSize: 8,
                lineStyle: { width: 2, type: "dashed" },
                color: "red",
              },
              {
                name: "最低分",
                type: "line",
                smooth: true,
                data: data.map((entry) => entry.lowest_score),
                showSymbol: true,
                symbol: "diamond",
                symbolSize: 8,
                lineStyle: { width: 2, type: "dashed" },
                color: "blue",
              },
            ],
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
  
  .chart {
    width: 100%;
    height: 400px;
  }
  </style>