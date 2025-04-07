<template>
  <div class="prediction-page">
    <SwitchButton v-model="mode" class="custom-switch" />

    <div class="view-container">
      <PersonalPredictionView v-if="mode === '个人'" />
      <OverallPredictionView v-if="mode === '总体'" />
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import SwitchButton from "@/components/SwitchButton.vue";
import PersonalPredictionView from "@/components/PersonalPredictionView.vue";
import OverallPredictionView from "@/components/OverallPredictionView.vue";

export default {
  components: {
    SwitchButton,
    PersonalPredictionView,
    OverallPredictionView,
  },
  setup() {
    const mode = ref(localStorage.getItem("predictionMode") || "总体");

    watch(mode, (newMode) => {
      localStorage.setItem("predictionMode", newMode);
    });

    return { mode };
  },
};
</script>

<style scoped>
.prediction-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.view-container {
  width: 100%;
  max-width: 1000px;
  text-align: center;
  box-sizing: border-box;
}
/* ✅ 覆盖 SwitchButton 滑块颜色为蓝色 */
::v-deep(.switch .slider) {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.4) !important;
}
</style>