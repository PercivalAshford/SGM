<template>
  <!-- 成绩排名提示框 -->
<div v-if="tooltip.visible" class="tooltip" :style="tooltip.style">
  <p>{{ tooltip.text }}</p>
</div>
  <div class="grades-container">
   

   <!-- 选择考试部分 -->
<div class="exam-selection">
  <label for="examSelect" class="exam-label">选择考试：</label>
  <select id="examSelect" v-model="selectedExamId" class="exam-dropdown">
    <option v-for="exam in exams" :key="exam.id" :value="String(exam.id)">
      {{ exam.exam_date }}
    </option>
  </select>
</div>

    <!-- 操作按钮组 -->
    <div class="button-group">
     <!-- 搜索框 -->
     <input v-model="searchQuery" placeholder="搜索学生..." class="search-box" />

      <!-- 排序按钮 -->
      <button @click="toggleSort('total_score')" class="sort-btn">
        <span>按总分排序</span>
       
      </button>

      <!-- 导出 Excel -->
      <button @click="exportToExcel" class="export-btn">
        <span>导出 Excel</span>
      </button>
    </div>

    <!-- 成绩表格 -->
    <div class="table-wrapper">
      <table v-if="grades.length">
        <thead>
          <tr>
            <th @click="toggleSort('name')">姓名</th>
            <th v-for="subject in subjects" :key="subject" @click="toggleSort(subject)">
              {{ subjectMap[subject] }}
            </th>
            <th @click="toggleSort('total_score')">
              总分 <span v-if="sortKey === 'total_score'">{{ sortOrder === 1 ? "" : "" }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in sortedGrades" :key="student.name">
            <td>{{ student.name }}</td>
            <td v-for="subject in subjects" 
    :key="subject" 
    @mouseover="showTooltip($event, student, subject)" 
    @mouseleave="hideTooltip">
  {{ student[subject] }}
            </td>
            <td class="highlight">{{ student.total_score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, watch } from "vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default {
  setup() {
    const exams = ref([]);
    const selectedExamId = ref("");
    const grades = ref([]);
    const searchQuery = ref("");
    const sortKey = ref("total_score");
    const sortOrder = ref(1);
    const loading = ref(false);
    const tooltip = ref({ visible: false, text: "", style: {} });

    const subjects = ["chinese", "math", "english", "physics", "chemistry", "biology"];
    const subjectMap = {
      chinese: "语文",
      math: "数学",
      english: "英语",
      physics: "物理",
      chemistry: "化学",
      biology: "生物",
    };

    const fetchExams = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/exams");
        exams.value = response.data;
        if (exams.value.length) {
          selectedExamId.value = String(exams.value[0].id);
        }
      } catch (error) {
        console.error("获取考试列表失败:", error);
      }
    };

    const fetchGrades = async () => {
      loading.value = true;
      try {
        const response = await axios.get(`http://localhost:3000/api/grades/${selectedExamId.value}`);
        grades.value = response.data;
      } catch (error) {
        console.error("获取成绩失败:", error);
      } finally {
        loading.value = false;
      }
    };

    watch(selectedExamId, () => {
      fetchGrades();
    });

    const filteredGrades = computed(() => {
      return grades.value.filter((student) => student.name.includes(searchQuery.value));
    });

    const sortedGrades = computed(() => {
      return [...filteredGrades.value].sort((a, b) => {
        return sortOrder.value * (a[sortKey.value] > b[sortKey.value] ? 1 : -1);
      });
    });

    const toggleSort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value *= -1;
      } else {
        sortKey.value = key;
        sortOrder.value = 1;
      }
    };
    const showTooltip = (event, student, subject) => {
  const scores = grades.value.map(s => s[subject]).sort((a, b) => b - a);
  const rank = scores.indexOf(student[subject]) + 1;
  const avg = (scores.reduce((sum, val) => sum + val, 0) / scores.length).toFixed(2);
  tooltip.value.text = `${student.name} 在 ${subjectMap[subject]} 的排名: ${rank}，班级平均分: ${avg}`;
  tooltip.value.style = { top: `${event.clientY + 10}px`, left: `${event.clientX + 10}px` };
  tooltip.value.visible = true;
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

    const exportToExcel = () => {
      const ws = XLSX.utils.json_to_sheet(grades.value);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "成绩表");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelBuffer]), "成绩.xlsx");
    };

    onMounted(fetchExams);

    return {
      exams,
      selectedExamId,
      grades,
      searchQuery,
      filteredGrades,
      sortedGrades,
      sortKey,
      sortOrder,
      toggleSort,
      exportToExcel,
      loading,
      subjects,
      subjectMap,
      tooltip,
      showTooltip,
      hideTooltip
    };
  },
};
</script>

<style scoped>
.grades-container {
  max-width: 900px;
  margin: auto;
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

/* 选择考试（文字和选择框在同一行） */
.exam-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

/* 按钮组 */
.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* 表格优化 */
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

table thead {
  background: #4caf50;
  color: white;
}

table tbody tr:nth-child(odd) {
  background: #f9f9f9;
}

table tbody tr:hover {
  background: #e3f2fd;
}

th, td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: center;
}

th {
  cursor: pointer;
}

.highlight {
  font-weight: bold;
  color: black;
}

/* 高级化的排序按钮 */
.sort-btn {
  background: linear-gradient(135deg, #34d399, #059669);
  color: white;
  border: none;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 12px;
  transition: 0.3s ease-in-out;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.sort-btn:hover {
  background: linear-gradient(135deg, #10b981, #047857);
  transform: scale(1.08);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}

.sort-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 高级化的导出 Excel 按钮 */
.export-btn {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  color: white;
  border: none;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 12px;
  transition: 0.3s ease-in-out;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.export-btn:hover {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  transform: scale(1.08);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}

.export-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
/* 高级感搜索框 */
.search-box {
  width: 250px;
  padding: 12px 15px;
  border-radius: 10px;
  font-size: 16px;
  border: 2px solid transparent;
  background-color: #f3f4f6;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  outline: none;
}

.search-box::placeholder {
  color: #9ca3af;
  font-size: 14px;
}

.search-box:hover {
  border: 2px solid #10b981;
}

.search-box:focus {
  border: 2px solid #10b981;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
  /* 选择考试部分 */
.exam-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* 让间距更紧凑 */
  margin-bottom: 16px; /* 让整体高度减少 */
}

/* 高级感标签 */
.exam-label {
  font-size: 14px; /* 字体稍微缩小 */
  font-weight: 600;
  color: #333;
}

/* 选择框（稍微小一点） */
.exam-dropdown {
  padding: 6px 12px; /* 内边距减少 */
  font-size: 14px; /* 字体缩小 */
  font-weight: 500;
  color: #333;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 6px; /* 让边角更加紧凑 */
  outline: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  appearance: none;
  height: 32px; /* 让高度更紧凑 */
  min-width: 120px; /* 适当缩小宽度 */
}

/* 选择框悬停效果 */
.exam-dropdown:hover {
  background: #ffffff;
  border-color: #aaa;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

/* 选择框选中效果 */
.exam-dropdown:focus {
  background: #ffffff;
  border-color: #007bff;
  box-shadow: 0 0 6px rgba(0, 123, 255, 0.4);
}

/* 选项优化 */
.exam-dropdown option {
  background: white;
  color: #333;
}
/* 成绩排名提示框 */
.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
}
</style>
