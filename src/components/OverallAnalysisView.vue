<template>
  <div class="overall-analysis">
    <FloatingNavBar />

    <h2>智能分析报告生成</h2>
    <ReportGenerator class="ReportGenerator" />

    <h2>各科平均分折线图</h2>
    <AvgScoresChart class="AvgScoresChart" />

    <h2>成绩分布直方图</h2>
    <ScoreDistributionChart class="ScoreDistributionChart" />

    <h2>成绩进步流图</h2>
    <ProgressStreamChart class="ProgressStreamChart" />

    <h2>科目相关性弦图</h2>
    <CorrelationChordChart class="CorrelationChordChart" />

    <h2>成绩聚类分析图</h2>
    <ClusterVisualization class="ClusterVisualization" />

    <h2>成绩箱型图</h2>
    <BoxPlotVisualization class="BoxPlotVisualization" />
  </div>
</template>

<script>
import AvgScoresChart from "@/components/AvgScoresChart.vue";
import ScoreDistributionChart from "@/components/ScoreDistributionChart.vue";
import ProgressStreamChart from "@/components/ProgressStreamChart.vue";
import CorrelationChordChart from "@/components/CorrelationChordChart.vue";
import ClusterVisualization from "./ClusterVisualization.vue";
import BoxPlotVisualization from "./BoxPlotVisualization.vue";
import FloatingNavBar from "./FloatingNavBar.vue";
import ReportGenerator from "./ReportGenerator.vue";

export default {
  components: {
    AvgScoresChart,
    ScoreDistributionChart,
    ProgressStreamChart,
    CorrelationChordChart,
    ClusterVisualization,
    BoxPlotVisualization,
    FloatingNavBar,
    ReportGenerator,
  },
};
</script>

<style scoped>
.overall-analysis {
  padding: 24px 40px;
  font-family: 'Helvetica Neue', sans-serif;
}

h2 {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin: 40px 0 20px;
  border-left: 4px solid #059669;
  padding-left: 10px;
}
</style>