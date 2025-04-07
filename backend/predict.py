from fastapi import FastAPI
import sqlite3
import pandas as pd
import xgboost as xgb
import pickle
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

# 加载训练好的模型
MODEL_PATH = "/Users/szc/sgm/sgm/backend/model_next_exam.pkl"
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# FastAPI 实例
app = FastAPI()


# 请求数据格式
class PredictRequest(BaseModel):
    student_id: int


# 获取指定学生最近 3 次成绩
def get_student_latest_scores(student_id):
    DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"
    conn = sqlite3.connect(DB_PATH)

    query = f"""
    SELECT chinese, math, english, physics, chemistry, biology
    FROM grades
    WHERE student_id = {student_id}
    ORDER BY exam_id DESC
    LIMIT 3
    """

    df = pd.read_sql(query, conn)
    conn.close()

    if df.shape[0] < 3:
        return None  # 数据不足

    # 构造特征输入
    X_input = df.iloc[::-1].reset_index(drop=True).T.values.flatten().reshape(1, -1)
    return X_input


# 获取所有学生 ID
def get_all_student_ids():
    DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"
    conn = sqlite3.connect(DB_PATH)
    query = "SELECT DISTINCT student_id FROM grades"
    df = pd.read_sql(query, conn)
    conn.close()
    return df["student_id"].tolist()


# 获取所有学生的最近 3 次成绩并预测
def predict_all_students():
    results = []
    all_ids = get_all_student_ids()
    for sid in all_ids:
        X_input = get_student_latest_scores(sid)
        if X_input is None:
            continue
        y_pred = model.predict(X_input).tolist()[0]
        results.append(
            {
                "student_id": sid,
                "predicted_scores": {
                    "chinese": y_pred[0],
                    "math": y_pred[1],
                    "english": y_pred[2],
                    "physics": y_pred[3],
                    "chemistry": y_pred[4],
                    "biology": y_pred[5],
                    "total": sum(y_pred),
                },
            }
        )
    return results


# 原有个人预测接口
@app.post("/predict")
def predict(request: PredictRequest):
    student_id = request.student_id
    DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"

    # 获取最近三次成绩作为输入
    X_input = get_student_latest_scores(student_id)

    if X_input is None:
        return {"error": "该学生数据不足，无法预测"}

    y_pred = model.predict(X_input).tolist()

    predicted_scores = {
        "chinese": y_pred[0][0],
        "math": y_pred[0][1],
        "english": y_pred[0][2],
        "physics": y_pred[0][3],
        "chemistry": y_pred[0][4],
        "biology": y_pred[0][5],
    }

    # 查询最近三次成绩的平均分
    conn = sqlite3.connect(DB_PATH)
    query = f"""
    SELECT chinese, math, english, physics, chemistry, biology
    FROM grades
    WHERE student_id = {student_id}
    ORDER BY exam_id DESC
    LIMIT 3
    """
    df = pd.read_sql(query, conn)
    conn.close()

    averages = df.mean().to_dict()

    return {
        "student_id": student_id,
        "predicted_scores": predicted_scores,
        "average_scores": averages,
    }


# 新增总体预测接口
@app.get("/predict/overall")
def overall_prediction():
    predictions = predict_all_students()

    # 获取最近一次考试成绩
    DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"
    conn = sqlite3.connect(DB_PATH)
    df_latest = pd.read_sql(
        """
        SELECT student_id, total_score
        FROM grades
        WHERE exam_id = (SELECT MAX(exam_id) FROM grades)
    """,
        conn,
    )
    conn.close()

    # 构造 DataFrame: 预测结果
    df_pred = pd.DataFrame(
        [
            {
                "student_id": p["student_id"],
                "predicted_total": p["predicted_scores"]["total"],
            }
            for p in predictions
        ]
    )

    # 合并历史成绩和预测成绩
    df_compare = pd.merge(df_latest, df_pred, on="student_id", how="inner")

    # 添加排名（从高分到低分）
    df_compare["old_rank"] = df_compare["total_score"].rank(
        method="min", ascending=False
    )
    df_compare["new_rank"] = df_compare["predicted_total"].rank(
        method="min", ascending=False
    )

    # 统计排名变化
    df_compare["rank_change"] = df_compare["old_rank"] - df_compare["new_rank"]

    improved = (df_compare["rank_change"] > 10).sum()
    declined = (df_compare["rank_change"] < -10).sum()
    unchanged = len(df_compare) - improved - declined
    subject_averages = get_subject_average_trends()

    return {
        "total_students": len(df_compare),
        "improved": int(improved),
        "declined": int(declined),
        "unchanged": int(unchanged),
        "subjectAverages": subject_averages,
    }


@app.get("/predict/declined-students")
def declined_students():
    predictions = predict_all_students()

    DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"
    conn = sqlite3.connect(DB_PATH)

    # 最近一次考试成绩：包含各科与总分
    df_latest = pd.read_sql(
        """
        SELECT student_id, chinese, math, english, physics, chemistry, biology, total_score
        FROM grades
        WHERE exam_id = (SELECT MAX(exam_id) FROM grades)
        """,
        conn,
    )
    conn.close()

    # 构造预测 DataFrame（含各科与总分）
    df_pred = pd.DataFrame(
        [
            {
                "student_id": p["student_id"],
                "pred_chinese": p["predicted_scores"]["chinese"],
                "pred_math": p["predicted_scores"]["math"],
                "pred_english": p["predicted_scores"]["english"],
                "pred_physics": p["predicted_scores"]["physics"],
                "pred_chemistry": p["predicted_scores"]["chemistry"],
                "pred_biology": p["predicted_scores"]["biology"],
                "pred_total": p["predicted_scores"]["total"],
            }
            for p in predictions
        ]
    )

    df_compare = pd.merge(df_latest, df_pred, on="student_id", how="inner")

    # 排名（按总分，从高到低）
    df_compare["old_rank"] = df_compare["total_score"].rank(
        method="min", ascending=False
    )
    df_compare["new_rank"] = df_compare["pred_total"].rank(
        method="min", ascending=False
    )
    df_compare["rank_change"] = df_compare["old_rank"] - df_compare["new_rank"]

    # 过滤退步学生（排名下降超过 10 名）
    declined_df = df_compare[df_compare["rank_change"] < -10].copy()
    declined_df["decline_amount"] = declined_df["rank_change"].abs()

    # 选取并重命名关键字段
    result = (
        declined_df.sort_values("decline_amount", ascending=False)[
            [
                "student_id",
                "old_rank",
                "new_rank",
                "decline_amount",
                "total_score",
                "pred_total",
                "chinese",
                "pred_chinese",
                "math",
                "pred_math",
                "english",
                "pred_english",
                "physics",
                "pred_physics",
                "chemistry",
                "pred_chemistry",
                "biology",
                "pred_biology",
            ]
        ]
        .rename(
            columns={
                "chinese": "real_chinese",
                "math": "real_math",
                "english": "real_english",
                "physics": "real_physics",
                "chemistry": "real_chemistry",
                "biology": "real_biology",
            }
        )
        .to_dict(orient="records")
    )

    return {"declined_students": result}


from fastapi import APIRouter
import sqlite3
import pandas as pd

router = APIRouter()


@router.get("/predict/subject-trends")
def subject_average_trends():
    DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"
    conn = sqlite3.connect(DB_PATH)

    query = """
    SELECT 
        exam_date,
        AVG(chinese) AS chinese,
        AVG(math) AS math,
        AVG(english) AS english,
        AVG(physics) AS physics,
        AVG(chemistry) AS chemistry,
        AVG(biology) AS biology
    FROM grades
    JOIN exams ON grades.exam_id = exams.id
    GROUP BY exam_date
    ORDER BY exam_date
    """

    df = pd.read_sql(query, conn)
    conn.close()

    return df.to_dict(orient="records")


# 从数据库中获取每次考试的平均分（按 exam_id 分组）
def get_subject_average_trends():
    DB_PATH = "/Users/szc/sgm/sgm/databases/grades.db"
    conn = sqlite3.connect(DB_PATH)

    query = """
        SELECT 
            exam_id,
            exam_date,
            AVG(chinese) AS chinese,
            AVG(math) AS math,
            AVG(english) AS english,
            AVG(physics) AS physics,
            AVG(chemistry) AS chemistry,
            AVG(biology) AS biology
        FROM grades
        JOIN exams ON grades.exam_id = exams.id
        GROUP BY exam_id
        ORDER BY exam_id ASC
    """

    df = pd.read_sql(query, conn)
    conn.close()
    return df.to_dict(orient="records")


# 运行 FastAPI 服务器
