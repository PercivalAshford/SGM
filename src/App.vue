<template>
  <!-- 主应用容器，使用动态主题类（dark/light） -->
  <div :class="theme" class="app-container">
    
    <!-- 仅在非登录页时显示 -->
    <template v-if="!isLoginPage">
      
      <!-- 标题区域 -->
      <div class="header">
        <h1 class="title">
          SGM <!-- 站点标题 -->
          <div class="loader-container">
            <!-- 加载动画 -->
            <div class="loader">
              <div class="outer"></div>
              <div class="middle"></div>
              <div class="inner"></div>
            </div>
          </div>
        </h1>
      </div>

      <!-- 导航栏 -->
      <nav class="navbar">
        <Navbar />
      </nav>
    </template>

    <!-- 主要内容区域（动态渲染路由组件） -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部组件（仅在非登录页显示） -->
    <FooterComponent v-if="!isLoginPage" />
  </div>
</template>

<script>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import FooterComponent from "@/components/FooterComponent.vue";

export default {
  components: {
    Navbar,
    FooterComponent,
  },
  setup() {
    const route = useRoute(); // 获取当前路由信息

    // 计算属性：判断是否为登录页面（如果路径以 "/login" 开头）
    const isLoginPage = computed(() => route.path.startsWith("/login"));

    return { isLoginPage };
  },
  data() {
    return {
      // 主题模式（从 localStorage 获取，默认为 "light"）
      theme: localStorage.getItem("theme") || "light",
    };
  },
};
</script>

<style scoped>
/* 主容器 */
.app-container {
  display: flex;
  flex-direction: column; /* 让子元素垂直排列 */
  min-height: 100vh; /* 让页面至少铺满整个屏幕 */
}

/* 标题区域（保持原样） */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.title {
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
  color: black;
}

/* 加载动画容器 */
.loader-container {
  display: flex;
  align-items: center;
  margin-left: 12px; /* 让动画与标题之间有间距 */
}

/* 旋转加载动画 */
.loader {
  position: relative;
  width: 1.5em;
  height: 1.5em;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 3 层旋转圆圈 */
.outer,
.middle,
.inner {
  border: 3px solid transparent;
  border-top-color: black; /* 仅顶部和右侧显示颜色 */
  border-right-color: black;
  border-radius: 50%; /* 圆形 */
  position: absolute;
}

/* 外层动画（速度最慢） */
.outer {
  width: 1.5em;
  height: 1.5em;
  animation: spin 2s linear infinite;
}

/* 中层动画（速度适中） */
.middle {
  width: 1.2em;
  height: 1.2em;
  animation: spin 1.75s linear reverse infinite;
}

/* 内层动画（速度最快） */
.inner {
  width: 0.8em;
  height: 0.8em;
  animation: spin 1.5s linear infinite;
}

/* 旋转动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 主要内容区域（包含路由视图） */
.main-content {
  flex: 1; /* 让其自动填充剩余高度 */
  padding: 20px;
  box-sizing: border-box; /* 确保 padding 不影响整体布局 */
}
</style>