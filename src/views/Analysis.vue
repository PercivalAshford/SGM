<template>
  <div class="analysis-page">
    <SwitchButton v-model="mode" />

    <div class="view-container">
      <PersonalAnalysisView v-if="mode === '个人'" />
      <OverallAnalysisView v-if="mode === '总体'" />
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import SwitchButton from "@/components/SwitchButton.vue";
import PersonalAnalysisView from "@/components/PersonalAnalysisView.vue";
import OverallAnalysisView from "@/components/OverallAnalysisView.vue";

export default {
  components: { SwitchButton, PersonalAnalysisView, OverallAnalysisView },
  setup() {
    // 首次加载时尝试从 localStorage 获取当前模式，没有时默认是总体
    const mode = ref(localStorage.getItem("analysisMode") || "总体");

    // 监听 mode 变化，将最新的 mode 存入 localStorage
    watch(mode, (newMode) => {
      localStorage.setItem("analysisMode", newMode);
    });

    return { mode };
  },
};
</script>
<style scoped>
.analysis-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box；
}

.view-container {
  width: 100%;
  max-width: 800px;
  text-align: center;
  box-sizing: border-box;
}
</style>