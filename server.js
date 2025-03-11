import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import { computeCorrelationMatrix } from "/Users/szc/sgm/sgm/utils/correlation.js"; // ✅ 引入计算逻辑
import { kmeans } from "ml-kmeans";

const app = express();
app.use(cors()); // 允许跨域访问
const db = new sqlite3.Database("./databases/grades.db");


// 获取学生总数
app.get("/api/students/count", (req, res) => {
    db.get("SELECT COUNT(*) AS total_students FROM students", (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(row);
    });
});

// 获取最近考试的平均分
app.get("/api/exams/latest_avg", (req, res) => {
    db.get(
        "SELECT AVG(total_score) AS latest_avg_score FROM grades WHERE exam_id = (SELECT MAX(exam_id) FROM exams)",
        (err, row) => {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ latest_avg_score: row.latest_avg_score.toFixed(2) });
        }
    );
});
// 获取所有考试列表（用于筛选）
app.get("/api/exams", (req, res) => {
    db.all("SELECT id, exam_date FROM exams ORDER BY exam_date DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 获取指定考试的成绩
app.get("/api/grades/:exam_id", (req, res) => {
    const examId = req.params.exam_id;
    db.all(
        "SELECT s.name, g.chinese, g.math, g.english, g.physics, g.chemistry, g.biology, g.total_score FROM grades g JOIN students s ON g.student_id = s.id WHERE g.exam_id = ?",
        [examId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});
app.get("/api/exams/count", (req, res) => {
    db.get("SELECT COUNT(*) AS total_exams FROM exams", (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(row);
    });
});

// 获取所有学生
app.get("/api/students", (req, res) => {
    db.all("SELECT id, name FROM students", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 添加新学生
app.post("/api/students", express.json(), (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "学生姓名不能为空" });
    }

    db.run("INSERT INTO students (name) VALUES (?)", [name], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name });
    });
});

// 删除学生
app.delete("/api/students/:id", (req, res) => {
    const studentId = req.params.id;
    db.run("DELETE FROM students WHERE id = ?", [studentId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});
// 获取某个学生的所有考试日期
app.get("/api/students/:id/exam-dates", (req, res) => {
    const studentId = req.params.id;
    db.all(
        "SELECT DISTINCT e.exam_date FROM grades g JOIN exams e ON g.exam_id = e.id WHERE g.student_id = ? ORDER BY e.exam_date DESC",
        [studentId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => row.exam_date)); // 只返回考试日期数组
        }
    );
});

// 获取某个学生在某次考试的成绩
app.get("/api/students/:id/grades", (req, res) => {
    const studentId = req.params.id;
    const examDate = Number(req.query.date); // 确保 examDate 是整数
    if (!examDate) {
        return res.status(400).json({ error: "缺少考试日期参数" });
    }

    db.get(
        `SELECT g.chinese, g.math, g.english, g.physics, g.chemistry, g.biology, g.total_score
         FROM grades g
         JOIN exams e ON g.exam_id = e.id
         WHERE g.student_id = ? AND e.exam_date = ?`,
        [studentId, examDate],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "未找到该考试的成绩" });
            res.json(row);
        }
    );
});
// 获取历次考试各科目的平均分
app.get("/api/exams/average-scores", (req, res) => {
    const sql = `
        SELECT e.exam_date, 
               AVG(g.chinese) AS chinese_avg, 
               AVG(g.math) AS math_avg, 
               AVG(g.english) AS english_avg, 
               AVG(g.physics) AS physics_avg, 
               AVG(g.chemistry) AS chemistry_avg, 
               AVG(g.biology) AS biology_avg
        FROM grades g
        JOIN exams e ON g.exam_id = e.id
        GROUP BY e.exam_date
        ORDER BY e.exam_date;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching average scores:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.json(rows);
    });
});
// 获取历次考试的最高分 & 最低分
app.get("/api/exams/highest-lowest-scores", (req, res) => {
    const sql = `
        SELECT e.exam_date, 
               MAX(g.total_score) AS highest_score, 
               MIN(g.total_score) AS lowest_score
        FROM grades g
        JOIN exams e ON g.exam_id = e.id
        GROUP BY e.exam_date
        ORDER BY e.exam_date;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching highest & lowest scores:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(rows);
    });
});

app.get("/api/exams/score-distribution", (req, res) => {
    const sql = `
        SELECT e.exam_date,
               SUM(CASE WHEN g.total_score >= 675 THEN 1 ELSE 0 END) AS "90以上",
               SUM(CASE WHEN g.total_score >= 637 AND g.total_score < 675 THEN 1 ELSE 0 END) AS "85-89",
               SUM(CASE WHEN g.total_score >= 600 AND g.total_score < 637 THEN 1 ELSE 0 END) AS "80-84",
               SUM(CASE WHEN g.total_score >= 562 AND g.total_score < 600 THEN 1 ELSE 0 END) AS "75-79",
               SUM(CASE WHEN g.total_score >= 525 AND g.total_score < 562 THEN 1 ELSE 0 END) AS "70-74",
               SUM(CASE WHEN g.total_score >= 487 AND g.total_score < 525 THEN 1 ELSE 0 END) AS "65-69",
               SUM(CASE WHEN g.total_score >= 450 AND g.total_score < 487 THEN 1 ELSE 0 END) AS "60-64",
               SUM(CASE WHEN g.total_score < 450 THEN 1 ELSE 0 END) AS "不及格"
        FROM grades g
        JOIN exams e ON g.exam_id = e.id
        GROUP BY e.exam_date
        ORDER BY e.exam_date;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching score distribution:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(rows);
    });
});
app.get("/api/exams/progress-trend", (req, res) => {
    const sql = `
      SELECT 
          e.exam_date,
          ROUND(100.0 * SUM(CASE WHEN g.total_score > prev.total_score THEN 1 ELSE 0 END) / COUNT(g.student_id), 2) AS improvement_percentage,
          ROUND(100.0 * SUM(CASE WHEN g.total_score < prev.total_score THEN 1 ELSE 0 END) / COUNT(g.student_id), 2) AS decline_percentage,
          ROUND(100.0 * SUM(CASE WHEN g.total_score = prev.total_score THEN 1 ELSE 0 END) / COUNT(g.student_id), 2) AS stable_percentage
      FROM grades g
      JOIN exams e ON g.exam_id = e.id
      LEFT JOIN grades prev ON prev.student_id = g.student_id 
      AND prev.exam_id = g.exam_id - 1
      WHERE prev.total_score IS NOT NULL
      GROUP BY e.exam_date
      ORDER BY e.exam_date;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("数据库查询失败:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(rows);
    });
});
// API：获取考试成绩并计算相关性
app.get("/api/exams/correlation-matrix", async (req, res) => {
    const sql = `
      SELECT 
          AVG(chinese) AS chinese,
          AVG(math) AS math,
          AVG(english) AS english,
          AVG(physics) AS physics,
          AVG(chemistry) AS chemistry,
          AVG(biology) AS biology,
          AVG(total_score) AS total_score
      FROM grades
      GROUP BY exam_id;
    `;

    try {
        // ✅ 封装 SQLite 查询为 Promise，防止崩溃
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error("数据库查询失败:", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // ✅ 确保 `rows` 存在且不为空
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "没有相关性数据" });
        }

        // ✅ 计算相关矩阵，防止 `undefined` 数据导致崩溃
        const correlationMatrix = computeCorrelationMatrix(rows);

        res.json(correlationMatrix);
    } catch (err) {
        console.error("❌ 计算相关性失败:", err);
        res.status(500).json({ error: "服务器内部错误" });
    }
});
// 📌 获取所有考试成绩并进行 KMeans 聚类
app.get("/api/exams/clusters", async (req, res) => {
    const sql = `
        SELECT g.student_id, s.name, g.exam_id, e.exam_date, 
               g.chinese, g.math, g.english, g.physics, g.chemistry, g.biology, g.total_score
        FROM grades g
        JOIN students s ON g.student_id = s.id
        JOIN exams e ON g.exam_id = e.id
        ORDER BY e.exam_date;
    `;

    try {
        // ✅ 查询所有学生在所有考试的成绩
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "没有找到考试数据" });
        }

        // ✅ 按考试批次分组
        const exams = {};
        rows.forEach(row => {
            const examDate = row.exam_date;
            if (!exams[examDate]) exams[examDate] = [];
            exams[examDate].push(row);
        });

        // ✅ 对每个考试批次进行 KMeans 聚类
        const clusterResults = {};
        Object.keys(exams).forEach(examDate => {
            const studentData = exams[examDate];

            // 提取成绩数据作为 KMeans 训练数据
            const data = studentData.map(s => [
                s.chinese, s.math, s.english, s.physics, s.chemistry, s.biology, s.total_score
            ]);

            // 选择合适的 K 值（可以调整）
            const k = 3;
            const clusters = kmeans(data, k);

            // 生成聚类结果
            clusterResults[examDate] = studentData.map((s, i) => ({
                id: s.student_id,
                name: s.name,
                cluster: clusters.clusters[i],
                chinese: s.chinese,
                math: s.math,
                english: s.english,
                physics: s.physics,
                chemistry: s.chemistry,
                biology: s.biology,
                total_score: s.total_score
            }));
        });

        res.json({
            exams: Object.keys(clusterResults),
            clusters: clusterResults
        });
    } catch (err) {
        console.error("❌ 计算 KMeans 失败:", err);
        res.status(500).json({ error: "服务器内部错误" });
    }
});
// API: 获取历次考试的各科成绩统计数据（Box Plot）
app.get("/api/exams/boxplot", (req, res) => {
    const sql = `
        SELECT 
            exam_date,
            json_group_array(chinese) AS chinese,
            json_group_array(math) AS math,
            json_group_array(english) AS english,
            json_group_array(physics) AS physics,
            json_group_array(chemistry) AS chemistry,
            json_group_array(biology) AS biology
        FROM grades
        JOIN exams ON grades.exam_id = exams.id
        GROUP BY exam_date
        ORDER BY exam_date;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching boxplot data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // 计算箱型图统计值（五数概括）
        const calculateBoxPlotData = (scores) => {
            if (!scores || scores.length === 0) return null;
            scores = scores.map(Number).sort((a, b) => a - b); // 转换为数值并排序

            const min = scores[0];
            const max = scores[scores.length - 1];
            const median = scores[Math.floor(scores.length / 2)];
            const q1 = scores[Math.floor(scores.length / 4)];
            const q3 = scores[Math.floor((3 * scores.length) / 4)];

            return [min, q1, median, q3, max];
        };

        // 处理数据库返回的数据
        const boxPlotData = rows.map(row => ({
            exam_date: row.exam_date,
            chinese: calculateBoxPlotData(JSON.parse(row.chinese)),
            math: calculateBoxPlotData(JSON.parse(row.math)),
            english: calculateBoxPlotData(JSON.parse(row.english)),
            physics: calculateBoxPlotData(JSON.parse(row.physics)),
            chemistry: calculateBoxPlotData(JSON.parse(row.chemistry)),
            biology: calculateBoxPlotData(JSON.parse(row.biology)),
        }));

        res.json(boxPlotData);
    });
});
app.get("/api/exams/latest-summary", async (req, res) => {
    try {
        // 获取最新考试日期
        const latestExamSql = `SELECT MAX(exam_date) AS latest_date FROM exams`;
        const latestExam = await new Promise((resolve, reject) => {
            db.get(latestExamSql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!latestExam || !latestExam.latest_date) {
            return res.status(404).json({ error: "没有找到最新考试数据" });
        }

        const latestDate = latestExam.latest_date;

        // 获取最新考试的总分数据
        const scoresSql = `
            SELECT g.total_score
            FROM grades g
            JOIN exams e ON g.exam_id = e.id
            WHERE e.exam_date = ?
        `;
        const scores = await new Promise((resolve, reject) => {
            db.all(scoresSql, [latestDate], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.total_score));
            });
        });

        if (!scores || scores.length === 0) {
            return res.status(404).json({ error: "没有找到该考试的成绩数据" });
        }

        // **手动计算标准差**
        const calculateStandardDeviation = (scores) => {
            const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
            return Math.sqrt(variance).toFixed(2);
        };

        const stddevTotalScore = calculateStandardDeviation(scores);

        // **获取班级统计数据**
        const summarySql = `
            SELECT 
                COUNT(g.student_id) AS student_count,
                ROUND(AVG(g.total_score), 2) AS avg_total_score,
                MAX(g.total_score) AS max_total_score,
                MIN(g.total_score) AS min_total_score
            FROM grades g
            JOIN exams e ON g.exam_id = e.id
            WHERE e.exam_date = ?
        `;

        const summary = await new Promise((resolve, reject) => {
            db.get(summarySql, [latestDate], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // **获取进步、退步、持平数据**
        const progressSql = `
            SELECT 
                ROUND(100.0 * SUM(CASE WHEN g.total_score > prev.total_score THEN 1 ELSE 0 END) / COUNT(g.student_id), 2) AS improvement_percentage,
                ROUND(100.0 * SUM(CASE WHEN g.total_score < prev.total_score THEN 1 ELSE 0 END) / COUNT(g.student_id), 2) AS decline_percentage,
                ROUND(100.0 * SUM(CASE WHEN g.total_score = prev.total_score THEN 1 ELSE 0 END) / COUNT(g.student_id), 2) AS stable_percentage
            FROM grades g
            JOIN exams e ON g.exam_id = e.id
            LEFT JOIN grades prev ON prev.student_id = g.student_id AND prev.exam_id = g.exam_id - 1
            WHERE e.exam_date = ? AND prev.total_score IS NOT NULL
        `;

        const progress = await new Promise((resolve, reject) => {
            db.get(progressSql, [latestDate], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // **返回最终数据**
        res.json({
            exam_date: latestDate,
            ...summary,
            stddev_total_score: stddevTotalScore,
            improvement_percentage: progress.improvement_percentage || 0,
            decline_percentage: progress.decline_percentage || 0,
            stable_percentage: progress.stable_percentage || 0,
        });

    } catch (err) {
        console.error("❌ 获取最新考试数据失败:", err);
        res.status(500).json({ error: "服务器内部错误" });
    }
});
// 📌 查询某个学生的个人成绩分析
app.get("/api/personal-analysis", (req, res) => {
    const query = req.query.query; // 获取前端传来的搜索关键词
    if (!query) {
        return res.status(400).json({ error: "缺少查询参数" });
    }

    // 🔎 先查询学生信息
    const sqlStudent = `
        SELECT id, name FROM students WHERE name LIKE ? OR id = ?
    `;
    db.get(sqlStudent, [`%${query}%`, query], (err, student) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!student) return res.status(404).json({ error: "未找到该学生" });

        // 🔎 查询该学生的成绩趋势
        const sqlScoresTrend = `
            SELECT e.exam_date, g.total_score 
            FROM grades g 
            JOIN exams e ON g.exam_id = e.id 
            WHERE g.student_id = ? 
            ORDER BY e.exam_date ASC
        `;
        db.all(sqlScoresTrend, [student.id], (err, scores) => {
            if (err) return res.status(500).json({ error: err.message });

            // 🔎 查询该学生的各科目平均成绩
            const sqlSubjectAverages = `
                SELECT 
                    AVG(chinese) AS chinese, 
                    AVG(math) AS math, 
                    AVG(english) AS english, 
                    AVG(physics) AS physics, 
                    AVG(chemistry) AS chemistry, 
                    AVG(biology) AS biology 
                FROM grades 
                WHERE student_id = ?
            `;
            db.get(sqlSubjectAverages, [student.id], (err, averages) => {
                if (err) return res.status(500).json({ error: err.message });

                // 返回前端所需的完整数据
                res.json({
                    studentInfo: {
                        id: student.id,
                        name: student.name
                    },
                    scoresTrend: {
                        dates: scores.map(row => row.exam_date),
                        scores: scores.map(row => row.total_score)
                    },
                    subjectAverages: averages
                });
            });
        });
    });
});
app.listen(3000, () => console.log("🚀 服务器运行在 http://localhost:3000"));