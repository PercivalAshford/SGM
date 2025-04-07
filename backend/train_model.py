import sqlite3
import pandas as pd
import xgboost as xgb
import pickle
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from math import sqrt

# 连接 SQLite 数据库
DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"  # 你的数据库路径
conn = sqlite3.connect(DB_PATH)

# 读取数据
query = """
SELECT grades.student_id, exams.exam_date, grades.chinese, grades.math, grades.english, 
       grades.physics, grades.chemistry, grades.biology
FROM grades
JOIN exams ON grades.exam_id = exams.id
ORDER BY grades.student_id, exams.exam_date
"""
df = pd.read_sql(query, conn)
conn.close()

# 构造滑动窗口特征（每个学生的过去 3 次考试作为输入）
for subject in ["chinese", "math", "english", "physics", "chemistry", "biology"]:
    df[f"prev_{subject}_1"] = df.groupby("student_id")[subject].shift(1)  # 上次考试
    df[f"prev_{subject}_2"] = df.groupby("student_id")[subject].shift(2)  # 上上次考试
    df[f"prev_{subject}_3"] = df.groupby("student_id")[subject].shift(3)  # 上上上次考试

# 删除前几场考试（因为它们没有 3 次历史成绩可用）
df = df.dropna()

# 定义输入 X 和目标 y
X = df[
    [
        "prev_chinese_1",
        "prev_chinese_2",
        "prev_chinese_3",
        "prev_math_1",
        "prev_math_2",
        "prev_math_3",
        "prev_english_1",
        "prev_english_2",
        "prev_english_3",
        "prev_physics_1",
        "prev_physics_2",
        "prev_physics_3",
        "prev_chemistry_1",
        "prev_chemistry_2",
        "prev_chemistry_3",
        "prev_biology_1",
        "prev_biology_2",
        "prev_biology_3",
    ]
]
y = df[["chinese", "math", "english", "physics", "chemistry", "biology"]]

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 训练 XGBoost 多输出回归模型
model = xgb.XGBRegressor(
    objective="reg:squarederror", n_estimators=200, learning_rate=0.05, max_depth=3
)
model.fit(X_train, y_train)

# 模型预测
y_pred = model.predict(X_test)

# 计算误差
mae = mean_absolute_error(y_test, y_pred)
rmse = sqrt(mean_squared_error(y_test, y_pred))
print(f"预测模型训练完成！\nMAE: {mae:.2f}, RMSE: {rmse:.2f}")

# 保存模型
MODEL_PATH = "backend/model_next_exam.pkl"
with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print(f"模型已保存到 {MODEL_PATH}")
