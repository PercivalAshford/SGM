// src/utils/axios-fastapi.js
import axios from 'axios';

const fastapi = axios.create({
    baseURL: 'http://localhost:8000', // FastAPI 实际运行地址
    timeout: 5000,
});

export default fastapi;