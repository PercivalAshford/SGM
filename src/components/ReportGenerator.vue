<template>
  <div class="report-container">
    <h2>班级本次考试成绩分析报告</h2>

    <!-- 生成报告按钮，点击后触发粒子化效果 -->
    <div ref="buttonWrapper" class="button-wrapper" @click="handleClick">
      <button
        v-if="!isParticleEffect"
        ref="generateButton"
        class="generate-btn"
        :disabled="loading"
      >
        {{ loading ? "" : "生成报告" }}
      </button>
    </div>

    <!-- 替换的加载动画 -->
    <div v-if="loading" class="balls">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";

export default {
  data() {
    return {
      loading: false,
      isParticleEffect: false, // 控制是否显示粒子效果
    };
  },
  methods: {
    async handleClick() {
      if (this.loading) return;

      // 显示粒子化效果
      this.triggerParticleEffect();
      
      // 显示加载动画
      setTimeout(async () => {
        this.loading = true;

        // 模拟数据加载
        setTimeout(async () => {
          try {
            const response = await axios.get(
              "http://localhost:3000/api/exams/latest-summary"
            );
            const data = response.data;

            // 创建PDF内容
            const reportContent = `
班级成绩分析报告
------------------------------------
本次考试时间：${data.exam_date}
参与学生人数：${data.student_count} 人

班级总体情况
- 班级平均总分：${data.avg_total_score} 分
- 最高分：${data.max_total_score} 分
- 最低分：${data.min_total_score} 分
- 成绩标准差：${data.stddev_total_score} 分（衡量成绩波动程度）

进步与退步情况
- 进步的学生占比：${data.improvement_percentage}%
- 退步的学生占比：${data.decline_percentage}%
- 成绩保持稳定的学生占比：${data.stable_percentage}%

分析总结
- 本次考试${
              data.improvement_percentage > data.decline_percentage
                ? "大部分学生取得进步"
                : "有较多学生成绩下降"
            }。
- 标准差为 ${data.stddev_total_score}，说明班级成绩${
              data.stddev_total_score > 20 ? "波动较大" : "较为稳定"
            }。

建议
1. 加强针对性辅导：
   - 针对${
     data.improvement_percentage > data.decline_percentage
       ? "部分退步的学生"
       : "整体成绩下滑"
   }，提供额外的学习资源。
2. 关注个别学生：
   - 如果有学生成绩大幅下降，建议进行个别辅导。
3. 提高稳定性：
   - 适当增加考试难度，训练学生适应不同类型的考察方式。
------------------------------------
          `;

            // 使用 jsPDF 生成PDF
            const pdf = new jsPDF();
            pdf.text(reportContent, 10, 10);
            pdf.save("班级成绩分析报告.pdf");
          } catch (error) {
            console.error("❌ 获取数据失败:", error);
            alert("❌ 无法获取成绩数据，请检查服务器连接。");
          } finally {
            this.loading = false; // 结束加载
          }
        }, 3000);
      }, 0);
    },
    triggerParticleEffect() {
      const button = this.$refs.generateButton;
      if (!button) return;

      // 添加 "cracked" 类名触发 CSS 动画
      button.classList.add("cracked");

      // 动画完成后隐藏按钮
      setTimeout(() => {
        this.isParticleEffect = true; // 标记粒子效果已完成
        button.style.display = "none"; // 移除按钮
      }, 10); // 1秒动画后隐藏
    },
  },
};
</script>

<style scoped>
.report-container {
  text-align: center;
  padding: 20px;
}

h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 15px;
}

/* 生成报告按钮 */
.generate-btn {
  font-size: inherit;
  font-family: inherit;
  color: white;
  padding: 0.5em 1em;
  outline: none;
  border: none;
  background-color: hsl(236, 32%, 26%);
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 按钮悬停 */
.generate-btn:hover {
  background-color: #65b1ff;
  transform: scale(1.05);
}

/* 点击后按钮碎裂动画 */
.generate-btn.cracked {
  animation: crack 1s forwards;
}

@keyframes crack {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  30% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
  60% {
    transform: scale(1.2) rotate(-5deg);
    opacity: 0.5;
  }
  100% {
    transform: scale(0) rotate(20deg);
    opacity: 0;
  }
}

/* 替换的加载动画 */
.balls {
  width: 3.5em;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto; /* 居中 */
}

.balls div {
  width: 0.8em;
  height: 0.8em;
  border-radius: 50%;
  background-color: #fc2f70;
  transform: translateY(-100%);
  animation: wave 0.8s ease-in-out alternate infinite;
}

.balls div:nth-of-type(1) {
  animation-delay: -0.4s;
}

.balls div:nth-of-type(2) {
  animation-delay: -0.2s;
}

@keyframes wave {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(100%);
  }
}
</style>