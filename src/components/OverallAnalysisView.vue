<template>
  <div class="overall-analysis">
    <FloatingNavBar />
    <ReportGenerator class="ReportGenerator" />
    <AvgScoresChart class="AvgScoresChart"/>
    <ScoreDistributionChart class="ScoreDistributionChart"/>
    <ProgressStreamChart class="ProgressStreamChart"/>
    <CorrelationChordChart class="CorrelationChordChart"/>
    <ClusterVisualization class="ClusterVisualization"/>
    <BoxPlotVisualization class="BoxPlotVisualization"/>
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