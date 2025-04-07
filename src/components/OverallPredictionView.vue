<template>
    <div class="overall-prediction">
      <h2>下次考试全班成绩预测</h2>
  
      <div v-if="loading" class="loading">预测数据加载中...</div>
  
      <div v-else>
        <!-- 模块 1：总览统计 -->
        <section class="summary">
          <div class="summary-item">
            <span class="label">总人数：</span>
            <span class="value">{{ predictionData.total_students }}</span>
          </div>
          <div class="summary-item">
            <span class="label">进步：</span>
            <span class="value text-green">{{ predictionData.improved }}</span>
          </div>
          <div class="summary-item">
            <span class="label">退步：</span>
            <span class="value text-red">{{ predictionData.declined }}</span>
          </div>
          <div class="summary-item">
            <span class="label">保持稳定：</span>
            <span class="value text-yellow">{{ predictionData.unchanged }}</span>
          </div>
        </section>
  
        <!-- 模块 2：各科目平均分趋势 -->
        <h2>各科目平均分趋势</h2>
        <SubjectAverageTrend
          v-if="predictionData.subjectAverages"
          :data="predictionData.subjectAverages"
        />
  
        <!-- 模块 3：进步/退步/稳定人数饼图 -->
        <h2>进步 / 退步 / 稳定 分布图</h2>
        <PredictionPieChart
          :data="{
            improved: predictionData.improved,
            declined: predictionData.declined,
            unchanged: predictionData.unchanged
          }"
        />
  
        <!-- 模块 4：退步学生名单 -->
        <h2>可能退步学生名单</h2>
        <DeclinedStudentList />
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import fastapi from '/Users/szc/sgm/sgm/utils/axios-fastapi';
  
  import ScoreChangeSummary from '@/components/ScoreChangeSummary.vue';
  import SubjectAverageTrend from '@/components/SubjectAverageTrend.vue';
  import PredictionPieChart from '@/components/PredictionPieChart.vue';
  import DeclinedStudentList from '@/components/DeclinedStudentList.vue';
  
  export default {
    components: {
      ScoreChangeSummary,
      SubjectAverageTrend,
      PredictionPieChart,
      DeclinedStudentList
    },
    setup() {
      const predictionData = ref({});
      const loading = ref(true);
  
      const fetchPrediction = async () => {
        try {
          const response = await fastapi.get('/predict/overall');
          predictionData.value = response.data;
          console.log('📊 预测数据:', predictionData.value);
        } catch (error) {
          console.error('预测数据获取失败:', error);
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(fetchPrediction);
  
      return {
        predictionData,
        loading
      };
    }
  };
  </script>
  
  <style scoped>
  .overall-prediction {
    padding: 24px 40px;
    font-family: 'Helvetica Neue', sans-serif;
  }
  
  .loading {
    text-align: center;
    font-size: 16px;
    margin-top: 40px;
    color: #888;
  }
  
  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #2c3e50;
    margin: 40px 0 20px;
    border-left: 4px solid #409EFF;
    padding-left: 10px;
  }
  
  .summary {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 40px;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .summary-item {
    min-width: 160px;
  }
  
  .label {
    font-weight: 500;
    color: #555;
  }
  
  .value {
    font-weight: bold;
    margin-left: 6px;
  }
  
  .text-green {
    color: #67C23A;
  }
  
  .text-red {
    color: #F56C6C;
  }
  
  .text-yellow {
    color: #E6A23C;
  }
  </style>