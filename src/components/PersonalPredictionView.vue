<template>
    <div class="personal-prediction">
      <!-- 搜索学生 -->
      <SearchBar @update-student="handleSearch" />
  
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading">预测中...</div>
  
      <!-- 学生信息展示 -->
      <div v-if="studentInfo && !isLoading">
        <h3>预测学生：{{ studentInfo.name }}（学号：{{ studentInfo.id }}）</h3>
      </div>
  
      <!-- 预测结果表格 -->
      <PredictedScoreTable
  v-if="predictedScores && !isLoading"
  :scores="predictedScores.predicted_scores"
/>
<RiskAnalysis
  v-if="predictedScores && !isLoading"
  :predicted="predictedScores.predicted_scores"
  :averages="predictedScores.average_scores"
/>
  
      <!-- 错误或无结果提示 -->
      <div v-if="noResult && !isLoading" class="no-result">
        未找到该学生或无法预测，请检查输入。
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import axios from 'axios';
  import SearchBar from '@/components/SearchBar.vue';
  import PredictedScoreTable from '@/components/PredictedScoreTable.vue';
  import RiskAnalysis from '@/components/RiskAnalysis.vue';
  
  export default {
    components: { SearchBar, PredictedScoreTable, RiskAnalysis },
    setup() {
      const studentInfo = ref(null);
      const predictedScores = ref(null);
      const isLoading = ref(false);
      const noResult = ref(false);
  
      const handleSearch = async ({ studentInfo: info }) => {
        if (!info || !info.id) return;
        isLoading.value = true;
        noResult.value = false;
        studentInfo.value = info;
  
        try {
          const response = await axios.post('http://localhost:8000/predict', 
          { student_id: info.id });
          predictedScores.value = response.data;
        } catch (error) {
          console.error('预测请求失败:', error);
          predictedScores.value = null;
          noResult.value = true;
        } finally {
          isLoading.value = false;
        }
      };
  
      return {
        studentInfo,
        predictedScores,
        isLoading,
        noResult,
        handleSearch,
      };
    }
  };
  </script>
  
  <style scoped>
  .personal-prediction {
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  
  .loading {
    margin-top: 20px;
    font-size: 16px;
    color: #666;
  }
  
  .no-result {
    margin-top: 20px;
    color: #f56c6c;
    font-size: 16px;
  }
  </style>
  