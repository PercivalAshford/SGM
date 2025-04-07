// src/utils/exportExcel.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportExamResultsToExcel(studentName, examResults) {
    const data = examResults.map(item => ({
        考试日期: item.exam_date,
        语文: item.chinese,
        数学: item.math,
        英语: item.english,
        物理: item.physics,
        化学: item.chemistry,
        生物: item.biology,
        总分: item.total_score
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '成绩数据');

    const filename = `${studentName}_成绩记录.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, filename);
}