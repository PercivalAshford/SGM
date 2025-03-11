import sqlite3
import pandas as pd
import os
import re

# 配置数据库路径
db_path = "/Users/szc/sgm/sgm/databases/grades.db"  # 确保路径正确
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 设置 CSV 文件夹路径
csv_folder = "/Users/szc/sgm/sgm/grade_sheet"  # 确保路径正确

# 获取所有 CSV 文件
csv_files = [f for f in os.listdir(csv_folder) if f.endswith(".csv")]

# 记录有问题的文件
problematic_files = []

# 遍历所有 CSV 文件
for selected_file in csv_files:
    file_path = os.path.join(csv_folder, selected_file)

    # 解析考试日期（文件名格式为 YYYYMMDD.csv）
    exam_date = selected_file.replace(".csv", "")

    # 确保考试日期格式正确
    if not re.match(r"^\d{8}$", exam_date):
        print(f"⚠️ 无效的考试日期格式: {selected_file}, 跳过")
        problematic_files.append(selected_file)
        continue

    # 获取 `exam_id`
    cursor.execute("SELECT id FROM exams WHERE exam_date = ?", (exam_date,))
    exam_id = cursor.fetchone()

    # 如果考试不存在，则插入并获取新 ID
    if not exam_id:
        cursor.execute("INSERT INTO exams (exam_date) VALUES (?)", (exam_date,))
        conn.commit()
        exam_id = cursor.lastrowid
    else:
        exam_id = exam_id[0]

    print(f"📌 处理文件: {selected_file}, 对应 exam_id: {exam_id}")

    # 读取 CSV 文件
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"❌ 读取文件 {selected_file} 时出错: {e}")
        problematic_files.append(selected_file)
        continue

    # 检查 CSV 结构是否符合预期
    expected_columns = ["姓名", "语文", "数学", "英语", "物理", "化学", "生物", "总分"]
    if not all(col in df.columns for col in expected_columns):
        print(f"⚠️ {selected_file} 格式不匹配，跳过")
        problematic_files.append(selected_file)
        continue

    # 处理空值（如果 `生物` 列有空值，则填充为 0）
    df["生物"] = df["生物"].fillna(0)

    # 插入成绩数据
    for _, row in df.iterrows():
        # 获取 `student_id`
        cursor.execute("SELECT id FROM students WHERE name = ?", (row["姓名"],))
        student_id = cursor.fetchone()

        if student_id:
            student_id = student_id[0]
            try:
                cursor.execute(
                    """
                    INSERT INTO grades (student_id, exam_id, chinese, math, english, physics, chemistry, biology, total_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        student_id,
                        exam_id,
                        row["语文"],
                        row["数学"],
                        row["英语"],
                        row["物理"],
                        row["化学"],
                        row["生物"],
                        row["总分"],
                    ),
                )
            except sqlite3.IntegrityError as e:
                print(f"❌ 插入 {selected_file} 的数据时出错: {e}")
                problematic_files.append(selected_file)
                break  # 直接跳过这个文件，继续处理下一个
        else:
            print(f"⚠️ 学生 {row['姓名']} 不在 students 表中，跳过")

    # 提交更改
    conn.commit()

# 关闭数据库连接
conn.close()

# 打印有问题的文件列表
if problematic_files:
    print("\n❌ 以下文件有问题，未成功导入:")
    for file in problematic_files:
        print(f"- {file}")
else:
    print("✅ 所有 CSV 文件数据已成功插入 SQLite 数据库！")
