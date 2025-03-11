<template>
  <div class="chart-container">
    <h2>学生成绩聚类分析</h2>
    <p class="description">选择考试批次和科目组合，查看学生成绩的聚类情况</p>

    <!-- 选择考试批次 -->
    <label for="exam-select">选择考试批次:</label>
    <select id="exam-select" v-model="selectedExam" @change="updateChart">
      <option v-for="exam in exams" :key="exam" :value="exam">
        {{ exam }}
      </option>
    </select>

    <!-- 选择 X 轴 和 Y 轴 科目 -->
    <label for="x-axis">选择 X 轴科目:</label>
    <select id="x-axis" v-model="selectedX" @change="updateChart">
      <option v-for="(name, key) in subjectNames" :key="key" :value="key">
        {{ name }}
      </option>
    </select>

    <label for="y-axis">选择 Y 轴科目:</label>
    <select id="y-axis" v-model="selectedY" @change="updateChart">
      <option v-for="(name, key) in subjectNames" :key="key" :value="key">
        {{ name }}
      </option>
    </select>

    <!-- 气泡图 -->
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import * as echarts from "echarts";
import { use } from "echarts/core";
import { ScatterChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, ScatterChart, CanvasRenderer]);

export default {
  components: { VChart },
  setup() {
    const chartOption = ref({});
    const exams = ref([]);
    const selectedExam = ref("");
    const selectedX = ref("math");
    const selectedY = ref("english");

    const subjectNames = {
      chinese: "语文",
      math: "数学",
      english: "英语",
      physics: "物理",
      chemistry: "化学",
      biology: "生物",
      total_score: "总分",
    };

    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/exams/clusters");
        const data = response.data;

        // ✅ 获取所有考试批次
        exams.value = data.exams;
        selectedExam.value = data.exams[0]; // 默认选择第一场考试

        // ✅ 绘制初始图表
        updateChart();
      } catch (error) {
        console.error("❌ 获取数据失败:", error);
      }
    };

    const updateChart = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/exams/clusters");
        const data = response.data;
        const selectedData = data.clusters[selectedExam.value];

        if (!selectedData) return;

        // ✅ 生成数据点
        const seriesData = selectedData.map((student) => ({
          name: student.name,
          value: [student[selectedX.value], student[selectedY.value], student.total_score],
          symbolSize: student.total_score / 50, // 气泡大小基于总分
          itemStyle: { color: getClusterColor(student.cluster), opacity: 0.7 }, // ✅ 透明度 0.7，避免重叠
        }));

        chartOption.value = {
          title: { text: `考试批次: ${selectedExam.value}`, left: "center" },
          tooltip: {
            trigger: "item",
            formatter: (params) => {
              return `
                <strong>${params.name}</strong><br/>
                ${subjectNames[selectedX.value]}: ${params.value[0]}<br/>
                ${subjectNames[selectedY.value]}: ${params.value[1]}<br/>
                总分: ${params.value[2]}
              `;
            },
          },
          legend: { bottom: 10, data: ["Cluster 0", "Cluster 1", "Cluster 2"] },
          xAxis: { type: "value", name: subjectNames[selectedX.value], min: 0, max: 150 },
          yAxis: { type: "value", name: subjectNames[selectedY.value], min: 0, max: 150 },
          series: [
            {
              name: "学生分布",
              type: "scatter",
              data: seriesData,
              symbolSize: (val) => val[2] / 10,
              emphasis: { focus: "series" },
            },
          ],
        };
      } catch (error) {
        console.error("❌ 更新图表失败:", error);
      }
    };

    // ✅ 获取不同聚类的颜色
    const getClusterColor = (cluster) => {
      const colors = ["#FF5733", "#33FF57", "#337BFF"];
      return colors[cluster % colors.length];
    };

    onMounted(fetchData);

    return { chartOption, exams, selectedExam, updateChart, selectedX, selectedY, subjectNames };
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

label {
  font-size: 16px;
  margin-right: 10px;
}

select {
  font-size: 16px;
  padding: 5px;
  margin: 5px;
}

.chart {
  width: 100%;
  height: 500px;
}
</style>