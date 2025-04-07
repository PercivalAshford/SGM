<template>
    <div class="search-bar">
      <input
        type="text"
        v-model="query"
        placeholder="请输入学生姓名或学号"
        @keyup.enter="search"
      />
      <button @click="search">搜索</button>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import axios from 'axios';
  
  export default {
    setup(_, { emit }) {
      const query = ref('');
      const studentData = ref({ studentInfo: null, examResults: [] });
      const noResult = ref(false);
  
      // 触发搜索
      const search = async () => {
        if (!query.value.trim()) {
          alert('请输入学生姓名或学号');
          return;
        }
        console.log("🔍 搜索参数:", query.value);
  
        noResult.value = false;
        studentData.value = { studentInfo: null, examResults: [] };
  
        try {
          const response = await axios.get('/api/student/exam-results', {
            params: { query: query.value }
          });
  
          console.log("📡 API 响应数据:", response.data);
  
          if (response.data && response.data.studentInfo) {
            studentData.value = response.data;
            noResult.value = false;
          } else {
            noResult.value = true;
          }
  
          // ✅ 直接发送完整数据（包含 examResults）
          emit('update-student', {
            studentInfo: studentData.value.studentInfo,
            examResults: studentData.value.examResults,
            noResult: noResult.value
          });
        } catch (error) {
          console.error("❌ 请求数据时出错:", error);
          noResult.value = true;
          emit('update-student', { studentInfo: null, examResults: [], noResult: true });
        }
      };
  
      return {
        query,
        search,
      };
    },
  };
  </script>
  
  <style scoped>
  .search-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
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
    transition: background-color 0.3s;
  }
  
  .search-bar button:hover {
    background-color: #337ecc;
  }
  </style>
