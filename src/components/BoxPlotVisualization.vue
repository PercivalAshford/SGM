<template>
  <div class="chart-container">
    <h2>班级各科目成绩分布（箱型图）</h2>
    <p class="description">查看班级各科目成绩的离散程度及异常值</p>

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
import { BoxplotChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, BoxplotChart, CanvasRenderer]);

export default {
  components: { VChart },
  setup() {
    const chartOption = ref({});
    const loading = ref(true);

    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/exams/boxplot");
        const data = response.data;

        if (!data || data.length === 0) {
          console.error("❌ API 数据为空");
          return;
        }

        console.log("📊 API 返回的箱型图数据:", data);

        // 提取考试日期
        const examDates = data.map(entry => entry.exam_date);
        const subjects = ["chinese", "math", "english", "physics", "chemistry", "biology"];
        const subjectNames = {
          chinese: "语文",
          math: "数学",
          english: "英语",
          physics: "物理",
          chemistry: "化学",
          biology: "生物",
        };

        // 计算箱型图数据
        const seriesData = subjects.map(subject => ({
          name: subjectNames[subject],
          type: "boxplot",
          data: data.map(entry => entry[subject]), // 五数统计
        }));

        // 配置 ECharts 图表
        chartOption.value = {
          title: { text: "班级各科目成绩分布（箱型图）", left: "center" },
          tooltip: { trigger: "item", formatter: (param) => {
              return `${param.seriesName} <br/> 最低值: ${param.data[0]} <br/> Q1: ${param.data[1]} <br/> 中位数: ${param.data[2]} <br/> Q3: ${param.data[3]} <br/> 最高值: ${param.data[4]}`;
            } 
          },
          legend: { top: 30, data: subjects.map(s => subjectNames[s]) },
          grid: { left: "10%", right: "10%", bottom: "15%" },
          xAxis: { type: "category", data: subjects.map(s => subjectNames[s]), axisLabel: { rotate: 30 } },
          yAxis: { type: "value", name: "成绩" },
          series: seriesData,
          animationDuration: 1500,
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
  height: 500px;
}

.loading {
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
  padding: 20px;
}
</style>