import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

// 将报告文本转为段落数组
function createParagraphs(content) {
    return content.split('\n').map(line =>
        new Paragraph({
            children: [new TextRun({ text: line, font: '宋体', size: 24 })],
        })
    );
}

export async function exportReportToWord(reportText, filename = "成绩分析报告.docx") {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: createParagraphs(reportText),
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
}