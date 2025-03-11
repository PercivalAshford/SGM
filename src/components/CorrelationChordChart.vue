<template>
    <div class="chart-container">
      <h2>科目与总分的相关性分析</h2>
      <p class="description">通过弦图展示各科目与总分的关系</p>
  
      <div v-if="loading" class="loading">数据加载中...</div>
      <div v-else class="chart-wrapper">
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import axios from "axios";
  import * as echarts from "echarts";
  import { use } from "echarts/core";
  import { GraphChart } from "echarts/charts";
  import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import VChart from "vue-echarts";
  
  use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphChart, CanvasRenderer]);
  
  export default {
    components: { VChart },
    setup() {
      const chartOption = ref({});
      const loading = ref(true);
  
      const fetchData = async () => {
        try {
          const response = await axios.get("http://localhost:3000/api/exams/correlation-matrix");
          const data = response.data;
  
          if (!data || Object.keys(data).length === 0) {
            console.error("❌ API 数据为空");
            return;
          }
  
          const subjects = ["chinese", "math", "english", "physics", "chemistry", "biology", "total_score"];
          const subjectNames = {
            chinese: "语文",
            math: "数学",
            english: "英语",
            physics: "物理",
            chemistry: "化学",
            biology: "生物",
            total_score: "总分",
          };
  
          const colors = {
            chinese: "#FF5733",
            math: "#FFD700",
            english: "#3498DB",
            physics: "#9B59B6",
            chemistry: "#1ABC9C",
            biology: "#E67E22",
            total_score: "#C0392B",
          };
  
          const nodes = subjects.map((key) => ({
            name: subjectNames[key],
            symbolSize: key === "total_score" ? 80 : 60,
            itemStyle: { color: colors[key] },
          }));
  
          const links = [];
          subjects.forEach((source) => {
            subjects.forEach((target) => {
              if (source !== target && data[source] && data[source][target] !== undefined) {
                const correlation = Math.abs(Number(data[source][target]));
                if (!isNaN(correlation)) {
                  links.push({
                    source: subjectNames[source],
                    target: subjectNames[target],
                    value: correlation * 100,
                    lineStyle: {
                      width: correlation * 6,
                      opacity: correlation * 0.9,
                      color: colors[source],
                    },
                  });
                }
              }
            });
          });
  
          chartOption.value = {
            title: {
              text: "科目与总分的相关性分析",
              left: "center",
              textStyle: { fontSize: 20, fontWeight: "bold" },
            },
            tooltip: {
              trigger: "item",
              formatter: (params) => {
                if (params.data.value) {
                  return `${params.data.source} ↔ ${params.data.target}: <strong>${params.data.value.toFixed(2)}%</strong>`;
                }
                return params.name;
              },
            },
            series: [
              {
                type: "graph",
                layout: "circular",
                data: nodes,
                links: links,
                edgeSymbol: ["circle", "arrow"],
                edgeSymbolSize: [8, 15],
                label: { show: true, fontSize: 14 },
                roam: false, // ✅ 禁用缩放和拖动
                force: { repulsion: 250 },
                lineStyle: { curveness: 0.3 },
                emphasis: {
                  focus: "adjacency",
                  lineStyle: { width: 4 },
                },
                animationDurationUpdate: 1500,
                animationEasingUpdate: "elasticOut",
              },
            ],
          };
  
          loading.value = false;
        } catch (error) {
          console.error("❌ 获取数据失败:", error);
          loading.value = false;
        }
      };
  
      onMounted(fetchData);
  
      return { chartOption, loading };
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    text-align: center;
    margin-top: 30px;
  }
  
  h2 {
    font-size: 26px;
    color: #333;
    font-weight: bold;
  }
  
  .description {
    font-size: 16px;
    color: #666;
    margin-bottom: 15px;
  }
  
  .chart-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 1000px;
  }
  
  .chart {
    width: 100%;
    height: 600px;
  }
  
  .loading {
    font-size: 18px;
    font-weight: bold;
    color: #007bff;
    padding: 20px;
    animation: blink 1.5s infinite;
  }
  
  @keyframes blink {
    50% {
      opacity: 0.5;
    }
  }
  </style>