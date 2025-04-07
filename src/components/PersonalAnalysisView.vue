<template>
  <div class="personal-analysis">
    <!-- 搜索组件 -->
    <SearchBar @update-student="handleSearchResult" />

    <!-- 加载中 -->
    <div v-if="isLoading" class="loading">加载中...</div>

    <!-- 搜索结果展示 -->
    <template v-else>
      <!-- 学生信息 -->
      <section v-if="studentInfo">
        <h2>学生基本信息</h2>
        <p>姓名：{{ studentInfo.name }}</p>
        <p>学号：{{ studentInfo.id }}</p>
      </section>

      <!-- 导出按钮 -->
      <section v-if="examResults.length && studentInfo">
        <button class="export-btn" @click="exportData">导出成绩为 Excel</button>
      </section>

      <!-- 成绩折线图 -->
      <section v-if="examResults.length">
        <h2>历次考试成绩趋势图</h2>
        <LineChart :scores="examResults" />
      </section>

      <!-- 平均成绩 vs 个人成绩 -->
      <section v-if="averageTrend.length && examResults.length">
        <h2>平均成绩 vs 个人成绩对比</h2>
        <ScoreComparisonChart
          :studentScores="examResults"
          :averageScores="averageTrend"
        />
      </section>

      <!-- 雷达图 -->
      <section v-if="studentInfo?.subjectAverages && classAverages">
        <h2>各科平均成绩雷达图</h2>
        <SubjectRadarChart
          :studentAverages="studentInfo.subjectAverages"
          :classAverages="classAverages"
        />
      </section>

      <!-- 无结果提示 -->
      <div v-if="noResult" class="no-result">
        未找到该学生信息，请检查输入内容。
      </div>
    </template>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

import SearchBar from '@/components/SearchBar.vue';
import LineChart from '@/components/LineChart.vue';
import ScoreComparisonChart from './ScoreComparisonChart.vue';
import SubjectRadarChart from '@/components/SubjectRadarChart.vue';
import { exportExamResultsToExcel } from '/Users/szc/sgm/sgm/utils/exportExcel'; // 路径统一为 @/utils

export default {
  components: {
    SearchBar,
    LineChart,
    ScoreComparisonChart,
    SubjectRadarChart
  },
  setup() {
    const studentInfo = ref(null);
    const examResults = ref([]);
    const averageTrend = ref([]);
    const classAverages = ref(null);
    const noResult = ref(false);
    const isLoading = ref(false);

    const fetchClassAverages = async () => {
      try {
        const response = await axios.get('/api/subjects/class-averages');
        classAverages.value = response.data;
        console.log('📊 班级各科平均成绩:', response.data);
      } catch (error) {
        console.error('❌ 获取班级平均成绩失败:', error);
      }
    };

    const handleSearchResult = async ({ studentInfo: result, examResults: scores, noResult: notFound }) => {
      isLoading.value = true;
      studentInfo.value = result;
      examResults.value = scores;
      noResult.value = notFound;

      try {
        const response = await axios.get('/api/exams/average-scores');
        averageTrend.value = response.data;
        console.log('📈 获取平均成绩趋势成功:', response.data);
      } catch (error) {
        console.error('❌ 获取平均成绩失败:', error);
        averageTrend.value = [];
      }

      if (result?.subjectAverages) {
        await fetchClassAverages();
      }

      isLoading.value = false;
    };

    const exportData = () => {
      if (studentInfo.value && examResults.value.length) {
        exportExamResultsToExcel(studentInfo.value.name, examResults.value);
      }
    };

    return {
      studentInfo,
      examResults,
      averageTrend,
      classAverages,
      noResult,
      isLoading,
      handleSearchResult,
      exportData
    };
  },
};
</script>

<style scoped>
.personal-analysis {
  padding: 24px 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
}

section {
  margin-bottom: 40px;
}

h2 {
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  border-left: 4px solid #409EFF;
  padding-left: 8px;
}

p {
  margin: 4px 0;
  font-size: 16px;
}

.loading {
  text-align: center;
  font-size: 18px;
  margin-top: 40px;
  color: #666;
}

.no-result {
  text-align: center;
  font-size: 16px;
  color: #f56c6c;
  margin-top: 30px;
}

.export-btn {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 15px;
  background-color: #67C23A;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: #52b13e;
}
</style>