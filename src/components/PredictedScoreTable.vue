<template>
    <div class="prediction-table-container">
      <h2>预测成绩表</h2>
      <table class="prediction-table">
        <thead>
          <tr>
            <th>科目</th>
            <th>预测分数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjects" :key="subject.key">
  <td>{{ subject.label }}</td>
  <td>{{ Math.round(scores[subject.key]) }}</td>
</tr>
<tr class="total-row">
  <td><strong>总分</strong></td>
  <td><strong>{{ totalScore }}</strong></td>
</tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
import { computed } from 'vue';

export default {
  props: {
    scores: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const subjects = [
      { key: 'chinese', label: '语文' },
      { key: 'math', label: '数学' },
      { key: 'english', label: '英语' },
      { key: 'physics', label: '物理' },
      { key: 'chemistry', label: '化学' },
      { key: 'biology', label: '生物' },
    ];

    const totalScore = computed(() => {
      return subjects.reduce((sum, subject) => {
        return sum + Math.round(props.scores[subject.key] || 0);
      }, 0);
    });

    return { subjects, totalScore };
  },
};
  </script>
  
  <style scoped>
  .prediction-table-container {
    margin: 20px auto;
    max-width: 600px;
    padding: 0 16px;
  }
  
  h2 {
    font-size: 20px;
    margin-bottom: 12px;
    color: #333;
    border-left: 4px solid #409EFF;
    padding-left: 8px;
  }
  
  .prediction-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
  }
  
  .prediction-table th,
  .prediction-table td {
    padding: 10px 12px;
    border: 1px solid #ccc;
    text-align: center;
  }
  
  .total-row td {
    background-color: #f5f7fa;
  }
  </style>