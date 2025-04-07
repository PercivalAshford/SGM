<template>
  <div class="summary-container">
    <div class="summary-item">
      <h3>进步人数</h3>
      <p class="count up">{{ improved }}</p>
    </div>
    <div class="summary-item">
      <h3>退步人数</h3>
      <p class="count down">{{ declined }}</p>
    </div>
    <div class="summary-item">
      <h3>保持稳定</h3>
      <p class="count stable">{{ unchanged }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    total: Number,
    improved: Number,
    declined: Number,
    unchanged: Number
  }
};
</script>

<style scoped>
.summary-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.summary-item {
  text-align: center;
  padding: 10px 0;
}

.summary-item h3 {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.count {
  font-size: 24px;
  font-weight: 600;
}

.count.up {
  color: #67C23A;
}

.count.down {
  color: #F56C6C;
}

.count.stable {
  color: #E6A23C;
}
</style>