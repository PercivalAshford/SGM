<template>
  <!-- 导航栏容器 -->
  <nav class="navbar">
    <router-link to="/" exact-active-class="active">数据概览</router-link>
    <router-link to="/students" exact-active-class="active">学生管理</router-link>
    <router-link to="/grades" exact-active-class="active">成绩查询</router-link>
    <router-link to="/analysis" exact-active-class="active">数据分析</router-link>
    <router-link to="/prediction" exact-active-class="active">成绩预测</router-link>
    <button class="logout-button" @click="logout">退出</button>
  </nav>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const logout = () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("role");
      router.push("/login"); // ✅ 直接跳转到登录页，而不强制刷新
    };

    return { logout };
  },
};
</script>

<style scoped>
/* 导航栏整体样式 */
.navbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--secondary-color);
  padding: 12px 80px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 导航链接的样式 */
.navbar a {
  color: var(--text-color);
  text-decoration: none;
  padding: 10px 70px;
  border-radius: 7px;
  transition: all 0.3s ease;
  font-size: 18px;
  font-family: "Noto Serif SC", sans-serif;
}

/* 鼠标悬停或当前激活状态的导航链接样式 */
.navbar a:hover, .navbar a.active {
  background: var(--btn-bg);
  transform: scale(1.2);
}

/* 退出按钮样式 */
.logout-button {
  background: white;
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #e43e50;
  transform: scale(1.1);
}
</style>