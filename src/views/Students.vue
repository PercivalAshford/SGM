<template>
  <div class="students-container">
    <!-- 搜索/添加学生 -->
    <div class="add-student">
      <input 
        v-model="searchQuery" 
        @keyup.enter="handleEnter" 
        placeholder="搜索或输入学生姓名..." />
      <button @click="addStudent">添加</button>
    </div>

    <!-- 学生列表 -->
    <div class="student-list">
      <transition-group name="fade">
        <div v-for="student in filteredStudents" :key="student.id" class="student-card">
          <div class="student-info">
            <p class="student-name">{{ student.name }}</p>
          </div>
          <div class="student-actions">
            <button @click="deleteStudent(student.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const students = ref([]); // 存储所有学生
    const searchQuery = ref(""); // 搜索框输入

    // 获取学生列表
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/students");
        students.value = response.data;
      } catch (error) {
        console.error("获取学生列表失败:", error);
      }
    };

    // 计算匹配的学生（搜索功能）
    const filteredStudents = computed(() => {
      return students.value.filter(student =>
        student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // 处理搜索框输入回车
    const handleEnter = () => {
      if (filteredStudents.value.length === 0 && searchQuery.value.trim()) {
        addStudent();
      }
    };

    // 添加学生
    const addStudent = async () => {
      if (!searchQuery.value.trim()) return alert("学生姓名不能为空");

      try {
        const response = await axios.post("http://localhost:3000/api/students", { name: searchQuery.value });
        students.value.push(response.data);
        searchQuery.value = ""; // 清空输入框
      } catch (error) {
        console.error("添加学生失败:", error);
      }
    };

    // 删除学生
    const deleteStudent = async (id) => {
      if (!confirm("确定要删除该学生吗？")) return;

      try {
        await axios.delete(`http://localhost:3000/api/students/${id}`);
        students.value = students.value.filter(student => student.id !== id);
      } catch (error) {
        console.error("删除学生失败:", error);
      }
    };

    onMounted(fetchStudents);

    return {
      students,
      searchQuery,
      filteredStudents,
      addStudent,
      deleteStudent,
      handleEnter,
    };
  }
};
</script>

<style scoped>
.students-container {
  width: 90%;
  max-width: 1200px;
  margin: 40px auto;
  text-align: center;
}

/* 搜索/添加学生 */
.add-student {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-student input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.add-student input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.add-student button {
  background-color: #007bff;
  color: white;
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.add-student button:hover {
  background-color: #0056b3;
}

.add-student button:active {
  transform: scale(0.95);
}

/* 学生列表 */
.student-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 0;
  justify-content: center;
}

/* 学生卡片 */
.student-card {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: all 0.3s;
}

.student-card:hover {
  transform: translateY(-5px);
}

.student-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.student-actions {
  display: flex;
  justify-content: center;
}

/* 默认状态，按钮颜色较浅 */
.delete-btn {
  background-color: #0056;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.2s;
}

/* 悬停时变红 */
.delete-btn:hover {
  background-color: red;
}

/* 按下时颜色更深一些 */
.delete-btn:active {
  background-color: #c45252;
  transform: scale(0.97);
}

</style>