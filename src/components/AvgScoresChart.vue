<template>
    <div class="chart-container">
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
          const response = await axios.get("http://localhost:3000/api/exams/average-scores");
          const data = response.data;
  
          const subjects = ["chinese", "math", "english", "physics", "chemistry", "biology"];
          const subjectNames = {
            chinese: "语文",
            math: "数学",
            english: "英语",
            physics: "物理",
            chemistry: "化学",
            biology: "生物",
          };
  
          // ✅ 转换 YYYYMMDD 格式为 "YYYY年MM月DD日"
          const formatDate = (dateStr) => {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}年${month}月${day}日`;
          };
  
          const examDates = data.map((entry) => formatDate(entry.exam_date));
  
          // 计算动态 Y 轴范围
          let allScores = [];
          subjects.forEach((subject) => {
            allScores = allScores.concat(data.map((entry) => entry[`${subject}_avg`]));
          });
          const minScore = Math.floor(Math.min(...allScores) / 10) * 10; // 取整
          const maxScore = Math.ceil(Math.max(...allScores) / 10) * 10; // 取整
  
          // 生成数据系列
          const seriesData = subjects.map((subject) => ({
            name: subjectNames[subject],
            type: "line",
            smooth: true,
            data: data.map((entry) => entry[`${subject}_avg`]),
            showSymbol: true,
            symbol: "circle",
            symbolSize: 6,
            lineStyle: { width: 2 },
            areaStyle: {
              opacity: 0.2,
            },
            emphasis: {
              focus: "series",
              lineStyle: { width: 3 },
            },
          }));
  
          // 配置 ECharts 图表
          chartOption.value = {
            title: { text: "历次考试科目平均分变化", left: "center" },
            tooltip: {
              trigger: "axis",
              backgroundColor: "rgba(50, 50, 50, 0.8)",
              borderRadius: 5,
              textStyle: { color: "#fff" },
              formatter: (params) => {
                let result = `<strong>${params[0].axisValue}</strong><br/>`;
                params.forEach((item) => {
                  result += `${item.marker} ${item.seriesName}: <strong>${item.value.toFixed(2)}</strong><br/>`;
                });
                return result;
              },
            },
            legend: {
              top: 30,
              data: subjects.map((s) => subjectNames[s]),
            },
            xAxis: {
              type: "category",
              data: examDates, // ✅ 使用格式化后的日期
              axisLabel: { rotate: 45 ,fontSize: 10,
              },

            },
            yAxis: {
              type: "value",
              min: minScore,
              max: maxScore,
              axisLabel: { formatter: "{value} 分" },
            },
            toolbox: {
              feature: {
                dataZoom: { yAxisIndex: "none" },
                restore: {},
                saveAsImage: {},
              },
            },
            series: seriesData,
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
    margin-bottom: 30px;
  }
  
  h2 {
    font-size: 24px;
    color: #333;
    font-weight: bold;
  }
  
  
  /* 图表样式 */
  .chart {
    width: 100%;
    height: 450px;
  }
  </style>