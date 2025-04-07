<template>
    <div class="declined-list">
    
  
      <table>
        <thead>
          <tr>
            <th>学生 ID</th>
            <th>原排名</th>
            <th>新排名</th>
            <th>退步名次</th>
            <th v-for="subject in subjects" :key="subject.key">
              {{ subject.label }}变化
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in declinedStudents" :key="student.student_id">
            <td>{{ student.student_id }}</td>
            <td>{{ student.old_rank }}</td>
            <td>{{ student.new_rank }}</td>
            <td class="decline">↓ {{ student.decline_amount }}</td>
            <td v-for="subject in subjects" :key="subject.key">
              <span :class="getChangeClass(student[`real_${subject.key}`], student[`pred_${subject.key}`])">
                {{ formatChange(student[`real_${subject.key}`], student[`pred_${subject.key}`]) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from '/Users/szc/sgm/sgm/utils/axios-fastapi.js';
  
  const declinedStudents = ref([]);
  
  const subjects = [
    { key: 'chinese', label: '语文' },
    { key: 'math', label: '数学' },
    { key: 'english', label: '英语' },
    { key: 'physics', label: '物理' },
    { key: 'chemistry', label: '化学' },
    { key: 'biology', label: '生物' }
  ];
  
  const getChangeClass = (real, pred) => {
    const diff = pred - real;
    if (diff > 5) return 'rise';
    if (diff < -5) return 'fall';
    return 'stable';
  };
  
  const formatChange = (real, pred) => {
    const diff = pred - real;
    const symbol = diff > 0 ? '+' : '';
    return `${Math.round(real)} → ${Math.round(pred)} (${symbol}${Math.round(diff)})`;
  };
  
  onMounted(async () => {
    try {
      const res = await axios.get('/predict/declined-students');
      declinedStudents.value = res.data.declined_students;
    } catch (e) {
      console.error('退步学生名单获取失败:', e);
    }
  });
  </script>
  
  <style scoped>
  .declined-list {
    max-width: 1000px;
    margin: 30px auto;
  }
  
  h3 {
    font-size: 20px;
    margin-bottom: 16px;
    border-left: 4px solid #f56c6c;
    padding-left: 10px;
    color: #333;
  }
  
  .decline {
    color: #f56c6c;
    font-weight: bold;
  }
  
  .rise {
    color: #67c23a;
  }
  
  .fall {
    color: #f56c6c;
  }
  
  .stable {
    color: #999;
  }
  
  th, td {
    padding: 8px 12px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  </style>