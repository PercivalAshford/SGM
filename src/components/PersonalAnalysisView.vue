<template>
  <div class="personal-analysis">
    <h2 class="title">个人成绩分析</h2>

    <!-- 搜索框 -->
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="请输入学生姓名或学号"
        @keyup.enter="searchStudent"
      />
      <button @click="searchStudent">搜索</button>
    </div>

    <!-- 个人信息展示区 -->
    <div class="card info-card" v-if="studentInfo.name !== '加载中...'">
      <h3>学生基本信息</h3>
      <p><strong>姓名：</strong>{{ studentInfo.name }}</p>
      <p><strong>学号：</strong>{{ studentInfo.id }}</p>
    </div>

    <!-- 成绩趋势可视化 -->
    <div class="card chart-card" v-if="chartVisible">
      <h3>成绩趋势图</h3>
      <canvas id="scoreTrendChart"></canvas>
    </div>

    <!-- 科目平均成绩雷达图 -->
    <div class="card chart-card" v-if="chartVisible">
      <h3>各科目成绩雷达图</h3>
      <canvas id="subjectRadarChart"></canvas>
    </div>

    <!-- 搜索提示 -->
    <div class="no-result" v-if="noResult">
      未找到该学生信息，请检查输入内容。
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default {
  setup() {
    const studentInfo = ref({
      name: '加载中...',
      id: '加载中...',
    });

    const searchQuery = ref('');
    const noResult = ref(false);
    const chartVisible = ref(false);

    let scoreTrendChartInstance = null;
    let subjectRadarChartInstance = null;

    const searchStudent = async () => {
      if (!searchQuery.value.trim()) {
        alert('请输入学生姓名或学号');
        return;
      }
      try {
        const response = await axios.get('/api/personal-analysis', {
          params: { query: searchQuery.value },
        });

        if (response.data && response.data.studentInfo) {
          studentInfo.value = response.data.studentInfo;
          noResult.value = false;
          chartVisible.value = true;

          updateScoreTrendChart(response.data.scoresTrend);
          updateSubjectRadarChart(response.data.subjectAverages);
        } else {
          noResult.value = true;
          chartVisible.value = false;
        }
      } catch (error) {
        console.error('请求数据时出错:', error);
        noResult.value = true;
        chartVisible.value = false;
      }
    };

    const updateScoreTrendChart = (scoresTrend) => {
      const ctx = document.getElementById('scoreTrendChart').getContext('2d');
      if (scoreTrendChartInstance) scoreTrendChartInstance.destroy();

      scoreTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: scoresTrend.dates,
          datasets: [{
            label: '总分趋势',
            data: scoresTrend.scores,
            fill: false,
            tension: 0.3,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
          },
        },
      });
    };

    const updateSubjectRadarChart = (subjectAverages) => {
      const ctx = document.getElementById('subjectRadarChart').getContext('2d');
      if (subjectRadarChartInstance) subjectRadarChartInstance.destroy();

      subjectRadarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: Object.keys(subjectAverages),
          datasets: [{
            label: '平均成绩',
            data: Object.values(subjectAverages),
            fill: true,
          }],
        },
        options: {
          responsive: true,
          scales: {
            r: { beginAtZero: true, max: 100 },
          },
        },
      });
    };

    return {
      studentInfo,
      searchQuery,
      searchStudent,
      noResult,
      chartVisible,
    };
  },
};
</script>

<style scoped>
.personal-analysis {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-bar input {
  width: 60%;
  padding: 10px;
  border-radius: 8px 0 0 8px;
  border: 1px solid #ccc;
  outline: none;
}

.search-bar button {
  padding: 10px 20px;
  border-radius: 0 8px 8px 0;
  border: none;
  background-color: #409EFF;
  color: white;
  cursor: pointer;
}

.search-bar button:hover {
  background-color: #337ecc;
}

.card {
  padding: 20px;
  margin-bottom: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.info-card p {
  margin: 8px 0;
}

.chart-card {
  height: 360px;
}

.no-result {
  text-align: center;
  color: #f56c6c;
  margin-top: 20px;
}
</style>