import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Students from '@/views/Students.vue';
import Grades from '@/views/Grades.vue';
import Analysis from '@/views/Analysis.vue';
import Prediction from '@/views/Prediction.vue';
import Login from '@/views/Login.vue';

// 定义路由规则（所有用户都可以访问）
const routes = [
    { path: '/', redirect: '/login' },  // 默认跳转到登录页
    { path: '/login', component: Login },
    { path: '/home', component: Home },  // ✅ 登录成功后跳转到 Home
    { path: '/students', component: Students, meta: { keepAlive: true } },
    { path: '/grades', component: Grades, meta: { keepAlive: true } },
    { path: '/analysis', component: Analysis },
    { path: '/prediction', component: Prediction }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";

    // ✅ 1. 未登录时跳转到 /login
    if (!loggedIn && to.path !== '/login') {
        return next('/login');
    }

    // ✅ 2. 已登录的用户访问 /login，自动跳转到 /home
    if (loggedIn && to.path === '/login') {
        return next('/home');
    }

    next();
});

export default router;