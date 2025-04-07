<template>
  <div class="students-container">
    <!-- 搜索/添加/导出 -->
    <div class="add-student">
      <input 
        v-model="searchQuery" 
        @keyup.enter="handleEnter" 
        placeholder="搜索姓名或学号..." />
      <button @click="addStudent">添加</button>
      <button @click="exportToExcel" class="export-btn">导出 Excel</button>
    </div>

    <!-- 学生列表 -->
    <div class="student-list">
      <transition-group name="fade">
        <div v-for="student in filteredStudents" :key="student.id" class="student-card">
          <div class="student-info">
            <p class="student-name">{{ student.name }}</p>
            <p class="student-id">学号：{{ student.id }}</p>
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default {
  setup() {
    const students = ref([]);
    const searchQuery = ref("");

    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/students");
        students.value = response.data;
      } catch (error) {
        console.error("获取学生列表失败:", error);
      }
    };

    const filteredStudents = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      return students.value.filter(student =>
        student.name.toLowerCase().includes(query) ||
        String(student.id).includes(query)
      );
    });

    const handleEnter = () => {
      if (filteredStudents.value.length === 0 && searchQuery.value.trim()) {
        addStudent();
      }
    };

    const addStudent = async () => {
      if (!searchQuery.value.trim()) return alert("学生姓名不能为空");

      try {
        const response = await axios.post("http://localhost:3000/api/students", { name: searchQuery.value });
        students.value.push(response.data);
        searchQuery.value = "";
      } catch (error) {
        console.error("添加学生失败:", error);
      }
    };

    const deleteStudent = async (id) => {
      if (!confirm("确定要删除该学生吗？")) return;

      try {
        await axios.delete(`http://localhost:3000/api/students/${id}`);
        students.value = students.value.filter(student => student.id !== id);
      } catch (error) {
        console.error("删除学生失败:", error);
      }
    };

    // ✅ 导出 Excel 功能
    const exportToExcel = () => {
      const exportData = filteredStudents.value.map(student => ({
        学号: student.id,
        姓名: student.name
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '学生列表');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      saveAs(blob, '学生列表.xlsx');
    };

    onMounted(fetchStudents);

    return {
      students,
      searchQuery,
      filteredStudents,
      addStudent,
      deleteStudent,
      handleEnter,
      exportToExcel
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

/* 顶部操作栏 */
.add-student {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

/* 添加按钮 */
.add-student button:first-of-type {
  background-color: #007bff;
  color: white;
}

.add-student button:first-of-type:hover {
  background-color: #0056b3;
}

/* ✅ 导出按钮 */
.export-btn {
  background-color: #28a745;
  color: white;
}

.export-btn:hover {
  background-color: #218838;
}

.export-btn:active {
  transform: scale(0.95);
}

.student-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 0;
  justify-content: center;
}

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
  margin-bottom: 6px;
}

.student-id {
  font-size: 14px;
  color: #888;
  margin-bottom: 10px;
}

.student-actions {
  display: flex;
  justify-content: center;
}

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

.delete-btn:hover {
  background-color: red;
}

.delete-btn:active {
  background-color: #c45252;
  transform: scale(0.97);
}
</style>