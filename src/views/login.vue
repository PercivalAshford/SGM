<template>
  <div class="login-container">
    <AnimatedBackground /> <!-- 引入静态背景 -->

    <div class="login-box">
      <h2 class="title">欢迎回来</h2>

      <!-- 账号输入框 -->
      <div class="input-wrapper">
        <input v-model="username" type="text" class="input-field" placeholder="账号" @keyup.enter="handleLogin" />
      </div>

      <!-- 密码输入框 -->
      <div class="input-wrapper">
        <input v-model="password" type="password" class="input-field" placeholder="密码" @keyup.enter="handleLogin" />
      </div>

      <!-- 登录按钮 -->
      <button class="login-button jelly" @click="handleLogin">登录</button>

      <p class="footer-text">忘记密码？<a href="#">重置</a></p>
    </div>
  </div>
</template>

<script>
import AnimatedBackground from "@/components/AnimatedBackground.vue";

export default {
components: {
  AnimatedBackground,
},
data() {
  return {
    username: "",
    password: "",
  };
},
methods: {
  handleLogin() {
    console.log("登录按钮被点击");
    console.log("用户名:", this.username);
    console.log("密码:", this.password);

    // ✅ 任何输入都可以成功登录
    console.log("登录成功，跳转中...");
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("role", "user"); // 可以根据需要调整
    this.$router.push("/home");  // ✅ 登录后跳转到首页
  },
},
};
</script>

<style scoped>
/* 页面容器 */
.login-container {
display: flex;
justify-content: center;
align-items: center;
height: 100vh;
position: relative;
overflow: hidden;
}

/* 登录框 */
.login-box {
position: relative;
background: rgba(255, 255, 255, 0.15);
padding: 55px 50px;
border-radius: 18px;
backdrop-filter: blur(20px);
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
text-align: center;
width: 380px;
z-index: 1;
transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-box:hover {
transform: scale(1.03);
box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}

/* 标题 */
.title {
color: #fff;
font-size: 28px;
font-weight: bold;
margin-bottom: 25px;
}

/* 输入框外框 */
.input-wrapper {
position: relative;
width: 100%;
margin-bottom: 20px;
display: flex;
justify-content: center;
}

/* 输入框 */
.input-field {
width: 85%;
padding: 14px;
border: 1px solid rgba(255, 255, 255, 0.5);
border-radius: 10px;
outline: none;
background: rgba(255, 255, 255, 0.2);
color: white;
font-size: 16px;
text-align: center;
transition: background 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border 0.3s ease;
}

.input-field::placeholder {
color: rgba(255, 255, 255, 0.6);
}

.input-field:focus {
background: rgba(255, 255, 255, 0.3);
box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
border: 1px solid rgba(255, 255, 255, 0.8);
}

/* 登录按钮 */
.login-button {
width: 85%;
padding: 12px;
border: none;
border-radius: 12px;
background: linear-gradient(90deg, #ff9800, #ff5722);
color: white;
font-size: 20px;
font-weight: bold;
cursor: pointer;
transition: transform 0.2s ease, background 0.3s ease, box-shadow 0.3s ease;
box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
margin-top: 20px;
}

/* 按钮 Jelly 动画 */
.jelly:hover {
animation: jelly 0.4s ease-in-out;
}

@keyframes jelly {
0%, 100% {
  transform: scale(1, 1);
}
25% {
  transform: scale(0.9, 1.1);
}
50% {
  transform: scale(1.05, 0.95);
}
75% {
  transform: scale(0.98, 1.02);
}
}

.login-button:active {
transform: scale(0.96);
box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

/* 底部链接 */
.footer-text {
margin-top: 20px;
color: rgba(255, 255, 255, 0.9);
font-size: 15px;
}

.footer-text a {
color: #ff9800;
text-decoration: none;
font-weight: bold;
transition: color 0.3s ease;
}

.footer-text a:hover {
color: #ff5722;
}
</style>