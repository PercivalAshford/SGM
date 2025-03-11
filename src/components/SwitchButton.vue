<template>
    <div class="switch-container" @click="toggle">
      <div :class="['switch', currentValue]">
        <span :class="['label', currentValue === 'left' ? 'active' : '']">总体</span>
        <span :class="['label', currentValue === 'right' ? 'active' : '']">个人</span>
        <div class="slider"></div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, watch } from "vue";
  
  export default {
    props: {
      modelValue: {
        type: String,
        default: '总体',
        validator: (value) => ['总体', '个人'].includes(value),
      },
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
      const currentValue = ref(props.modelValue === '个人' ? 'right' : 'left');
  
      const toggle = () => {
        currentValue.value = currentValue.value === 'left' ? 'right' : 'left';
        emit("update:modelValue", currentValue.value === 'left' ? '总体' : '个人');
      };
  
      watch(() => props.modelValue, (newVal) => {
        currentValue.value = newVal === '个人' ? 'right' : 'left';
      });
  
      return { currentValue, toggle };
    },
  };
  </script>
  
  <style scoped>
  .switch-container {
    width: 160px;
    height: 46px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.2s ease-in-out;
  }
  
  .switch-container:hover {
    transform: scale(1.03);
  }
  
  .switch {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #f0f4f8;
    border-radius: 25px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    box-sizing: border-box;
    color: #64748b;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 更现代化字体 */
    font-weight: 600;
    font-size: 15px;
  }
  
  .label {
    z-index: 1;
    flex: 1;
    text-align: center; /* 文字居中 */
    transition: color 0.3s ease;
  }
  
  .label.active {
    color: #ffffff;
  }
  
  .slider {
    position: absolute;
    width: 50%;
    height: 80%;
    background: linear-gradient(135deg, #34d399, #059669);
    border-radius: 25px;
    transition: all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 3px 8px rgba(5, 150, 105, 0.4);
  }
  
  .switch.left .slider {
    left: 4px;
  }
  
  .switch.right .slider {
    left: calc(50% - 4px);
  }
  </style>