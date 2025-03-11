<template>
  <div class="home-container">
    <!-- 标题部分 -->
    <div class="header">
      <h1 class="welcome-title">欢迎使用学生成绩管理系统</h1>
      <p class="description">SGM轻松帮您管理学生成绩，并进行数据分析，让教学更智能！</p>
    </div>

    <!-- 统计数据区域 -->
    <div class="stats-container">
      <div class="stat-box">
        <h2>班级学生总数</h2>
        <p class="stat-number">{{ animatedStudents }}</p>
      </div>
      <div class="stat-box">
        <h2>考试总次数</h2>
        <p class="stat-number">{{ animatedExams }}</p>
      </div>
    </div>

    <!-- 倒计时区域 -->
    <div class="countdown-container">
      <div class="countdown-box">
        <h2>下一次考试倒计时</h2>
        <p class="countdown-time">{{ countdownText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      totalStudents: 0, // 学生总数
      totalExams: 0, // 考试总次数
      animatedStudents: 0, // 动画数字
      animatedExams: 0, // 动画数字
      nextExamDate: null, // 下一次考试日期
      countdownText: "加载中..." // 倒计时文本
    };
  },
  mounted() {
    this.fetchStats();
    this.fetchNextExam();
  },
  methods: {
    async fetchStats() {
      try {
        const studentResponse = await axios.get("http://localhost:3000/api/students/count");
        this.totalStudents = studentResponse.data.total_students;

        const examResponse = await axios.get("http://localhost:3000/api/exams/count");
        this.totalExams = examResponse.data.total_exams;

        this.animateNumbers();
      } catch (error) {
        console.error("获取统计数据失败:", error);
      }
    },
    fetchNextExam() {
    // 直接设置下次考试时间为 2026-06-07 08:00:00
    this.nextExamDate = new Date("2026-06-07T08:00:00");

    // 启动倒计时
    this.updateCountdown();
    setInterval(this.updateCountdown, 1000); // 每秒更新倒计时
  },
  updateCountdown() {
    if (!this.nextExamDate) return;

    const now = new Date();
    const timeDiff = this.nextExamDate - now;

    if (timeDiff <= 0) {
      this.countdownText = "考试进行中或已结束";
      return;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    this.countdownText = `${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
  },
    updateCountdown() {
      if (!this.nextExamDate) return;
      
      const now = new Date();
      const timeDiff = this.nextExamDate - now;

      if (timeDiff <= 0) {
        this.countdownText = "考试进行中或已结束";
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      this.countdownText = `${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
    },
    animateNumbers() {
      this.animateValue("animatedStudents", this.totalStudents);
      this.animateValue("animatedExams", this.totalExams);
    },
    animateValue(variable, endValue) {
      let start = 0;
      const duration = 1000;
      const interval = 20;
      const step = (endValue - start) / (duration / interval);

      const timer = setInterval(() => {
        if (start >= endValue) {
          this[variable] = endValue;
          clearInterval(timer);
        } else {
          start += step;
          this[variable] = Math.floor(start);
        }
      }, interval);
    }
  }
};
</script>

<style scoped>
/* 页面整体布局 */
.home-container {
  text-align: center;
  
  max-width: 1000px;
  margin: auto;
}

/* 标题区域 */
.header {
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  margin-bottom: 10px;
}

.description {
  font-size: 18px;
  color: #555;
}

/* 统计数据区域 */
.stats-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 统计卡片 */
.stat-box {
  background: rgba(255, 255, 255, 0.3);
  padding: 20px 30px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.stat-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.stat-box h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 5px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #f39c12;
  transition: all 0.5s ease;
}

/* 倒计时样式 */
.countdown-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.countdown-box {
  background: rgba(255, 255, 255, 0.3);
  padding: 20px 40px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.countdown-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.countdown-box h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.countdown-time {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  transition: all 0.5s ease;
}
</style>