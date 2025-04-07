from fastapi import FastAPI
from predict import predict, overall_prediction, PredictRequest  # 导入接口
from fastapi.middleware.cors import CORSMiddleware
from predict import predict, overall_prediction, declined_students

app = FastAPI()

# 添加接口（和你原来一样）

app.post("/predict")(predict)
app.get("/predict/declined-students")(declined_students)
app.get("/predict/overall")(overall_prediction)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 或 ["*"] 仅用于开发
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 本地运行入口
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
