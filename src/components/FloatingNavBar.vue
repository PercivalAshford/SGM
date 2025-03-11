<template>
    <div
      class="floating-nav"
      :class="{ locked: isLocked }"
      @mousedown="!isLocked && startDrag($event)"
    >
      <div class="nav-header">
        <span class="nav-title">数据导航</span>
        <button class="lock-btn" @click.stop="toggleLock">
          {{ isLocked ? "解锁位置" : "锁定位置" }}
        </button>
      </div>
      <div class="nav-items">
        <div
          class="nav-item"
          v-for="item in navItems"
          :key="item.name"
          @click="navigate(item.ref)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isLocked: true,
        dragging: false,
        offset: { x: 0, y: 0 },
        navItems: [
        { name: "ReportGenerator", label: "报告生成", ref: "ReportGenerator" },
          { name: "avgScores", label: "平均分趋势", ref: "AvgScoresChart" },
          { name: "scoreDistribution", label: "成绩分布", ref: "ScoreDistributionChart" },
          { name: "progressStream", label: "成绩流", ref: "ProgressStreamChart" },
          { name: "correlationChord", label: "科目相关性", ref: "CorrelationChordChart" },
          { name: "clusterVisualization", label: "聚类分析", ref: "ClusterVisualization" },
          { name: "boxPlot", label: "箱型图", ref: "BoxPlotVisualization" },
        ],
      };
    },
    mounted() {
      this.setDefaultPosition();
    },
    methods: {
      toggleLock() {
        this.isLocked = !this.isLocked;
      },
      setDefaultPosition() {
        const nav = this.$el;
        nav.style.top = "320px";
        nav.style.right = "50px";
      },
      startDrag(e) {
        this.dragging = true;
        this.offset = {
          x: e.clientX - this.$el.offsetLeft,
          y: e.clientY - this.$el.offsetTop,
        };
        document.addEventListener("mousemove", this.drag);
        document.addEventListener("mouseup", this.endDrag);
      },
      drag(e) {
        if (!this.dragging) return;
        this.$el.style.left = e.clientX - this.offset.x + "px";
        this.$el.style.top = e.clientY - this.offset.y + "px";
        this.$el.style.right = "auto";
      },
      endDrag() {
        this.dragging = false;
        document.removeEventListener("mousemove", this.drag);
        document.removeEventListener("mouseup", this.endDrag);
      },
      navigate(componentName) {
        const el = document.querySelector(`.${componentName}`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
  };
  </script>
  
  <style scoped>
  .floating-nav {
    position: fixed;
    top: 300px;
    right: 50px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
    padding: 12px;
    user-select: none;
    z-index: 1000;
    transition: box-shadow 0.3s, transform 0.2s;
  }
  
  .floating-nav:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  .floating-nav.locked {
    cursor: default;
  }
  
  .floating-nav:not(.locked) {
    cursor: grab;
  }
  
  .floating-nav:active {
    cursor: grabbing;
  }
  
  .nav-header {
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    padding-bottom: 6px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .lock-btn {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    background-color: rgba(240, 240, 240, 0.9);
    border: none;
  }
  
  .lock-btn:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
  
  .nav-item {
    padding: 6px 12px;
    margin: 4px 0;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.2s;
  }
  
  .nav-item:hover {
    background-color: rgba(0, 123, 255, 0.1);
  }
  </style>