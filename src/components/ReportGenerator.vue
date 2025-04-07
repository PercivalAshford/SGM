<template>
  <div class="report-container">

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
import { exportReportToWord } from '/Users/szc/sgm/sgm/utils/exportReportToWord';

export default {
  data() {
    return {
      loading: false,
      isParticleEffect: false, // 控制是否显示粒子效果
      exportReportToWord
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
三次考试成绩详细分析报告

1. 总体成绩分析

在过去的三次考试中（2021年2月16日、3月2日、5月17日），整体成绩趋势表现如下：
	•	总分平均值变化：整体而言，总分平均值略有波动，但基本保持稳定，说明大部分学生的学习状态较为稳定。
	•	个体差异明显：有部分学生成绩稳定在高分段，而部分学生的成绩波动较大，个别科目可能出现较大滑坡，影响了排名。

从考试数据来看，最高总分稳定在 700 分左右，最低总分大约在 500 分上下，反映出学生成绩的整体分布较为均衡，但仍然存在部分学生需要提升成绩。

2. 学科表现分析

在这三次考试中，不同学科的平均分表现如下：

科目	2021-02-16	2021-03-02	2021-05-17	变化趋势
语文	平均 120+	平均 125+	平均 128+	小幅上升
数学	平均 130+	平均 135+	平均 140+	稳步提升
英语	平均 115+	平均 120+	平均 125+	稳定增长
物理	平均 95+	平均 100+	平均 102+	较为平稳
化学	平均 85+	平均 90+	平均 92+	小幅增长
生物	平均 80+	平均 85+	平均 88+	缓慢提升

重点学科观察
	1.	数学、语文和英语表现较稳定
	•	数学平均分一直在130 分以上，且高分段较多，说明整体数学教学效果较好。
	•	语文和英语的成绩呈现稳定上升趋势，说明阅读与写作能力有所提升。
	2.	物理、化学、生物分差较大
	•	物理：高分学生能稳定在 105 分以上，但低分段学生可能长期停留在 80 分左右，建议进行更有针对性的补习。
	•	化学：整体表现相对较好，但低分段的学生需要重点提升基础知识，避免因细节失误失分。
	•	生物：虽然整体有小幅度提升，但仍然是部分学生的弱势学科，需要增加记忆性知识点的复习。

3. 学生个体分析

在本次考试中，以下几类学生需要特别关注：

（1）成绩稳定在高分段的优秀学生

这些学生的成绩保持在 680 分以上，且在所有科目中都表现突出：
	•	冯锦程（708 分）
	•	吴嘉豪（708 分）
	•	郭睿（704 分）
	•	邵景瑞（704 分）
	•	唐逸（702 分）

	建议：继续保持良好学习习惯，关注细节，提高答题准确率。

（2）进步明显的学生

部分学生在本次考试中相较于前两次考试成绩提升较大，说明学习方法或努力方向正确：
	•	范天成（从 680+ 提升至 697）
	•	黄欣妍（从 670+ 提升至 684）
	•	徐语嫣（从 680+ 提升至 691）

	建议：总结此次进步的关键点，保持积极的学习态度，巩固优势学科。

（3）成绩波动较大的学生

这些学生在考试中成绩起伏较大，说明部分学科的基础不够扎实：
	•	邓彦澈（总分 661，物理分数下降明显）
	•	魏嘉晟（总分 597，数学和英语分数下降）
	•	郑佳怡（总分 577，英语和生物下降）

	建议：分析个人薄弱学科，针对性复习，适当调整学习方法。

（4）需要重点关注的低分学生

以下学生的成绩相对较低，需要重点提升：
	•	张沐阳（510 分）
	•	何婧怡（510 分）
	•	孙可欣（529 分）

	建议：这些学生可能在多个科目上存在较大问题，建议针对性补习，特别是数学、英语和理科科目。

4. 重点建议
	1.	针对低分学生，重点提升理科成绩
	•	物理、化学、生物是影响排名的关键科目，建议进行针对性辅导，强化基础知识，并进行更多题目训练。
	2.	高分学生保持稳定，关注解题技巧
	•	高分段学生可以开始训练更复杂的题型，提高思维能力，减少答题时间，提高准确率。
	3.	中等生重点加强单科提升
	•	找到自己最薄弱的学科，集中时间突破某一科，提高整体总分。
	4.	英语和语文长期稳定上升
	•	继续积累阅读量，保证作文训练，提高理解能力和写作能力。
	5.	数学是最容易拉开差距的学科
	•	数学成绩波动较大，高分段学生基本都在 140 分以上，而低分段学生在 100 分以下，因此数学的学习需要特别重视。

5. 总结
	•	整体来看，成绩分布较为均匀，但部分科目仍然存在较大差距。
	•	数学、物理和化学是影响排名的重要科目，需要特别关注基础较弱的学生。
	•	优秀学生成绩稳定，但仍然有提升空间，建议关注细节和解题技巧。
	•	部分学生成绩起伏较大，需要重点查漏补缺，找到影响成绩的关键因素。

最终建议：
	•	低分段学生应该集中精力补习薄弱学科，特别是数学、物理和生物。
	•	中等成绩的学生可以通过提高某一门学科成绩进入更高的排名区间，建议关注自己最薄弱的科目。
	•	优秀学生继续巩固基础，同时挑战更高难度的题型，为下一阶段的考试做好准备。

如果需要进一步的个体分析或者针对性辅导建议，请告诉我！
          `;

            // 使用 jsPDF 生成PDF
            exportReportToWord(reportContent, "班级成绩分析报告.docx");
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
  background-color: hsl(137, 62%, 57%);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
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