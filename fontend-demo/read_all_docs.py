import zipfile
import xml.etree.ElementTree as ET
import os

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            
            text = []
            for paragraph in tree.iter(NAMESPACE + 'p'):
                texts = [node.text
                         for node in paragraph.iter(NAMESPACE + 't')
                         if node.text]
                if texts:
                    text.append(''.join(texts))
            return '\n'.join(text)
    except Exception as e:
        return str(e)

docs_to_read = [
    r"D:\Program Files\QLNS\QLNS\KHUNG NĂNG LỰC SỐ THEO DIGCOMP CHO SME.docx",
    r"D:\Program Files\QLNS\QLNS\dung_bam_vao_day\khung-chuong-trinh-15-khoa-digcomp.docx",
    r"D:\Program Files\QLNS\QLNS\dung_bam_vao_day\BÁO CÁO XÂY DỰNG MA TRẬN NĂNG LỰC SỐ THEO VỊ TRÍ.docx",
    r"D:\Program Files\QLNS\QLNS\tai lieu\giaotrinh-mien6-AI.docx"
]

out_path = r"D:\Program Files\QLNS\QLNS\project_demo\all_framework_docs.txt"
with open(out_path, "w", encoding="utf-8") as out:
    for p in docs_to_read:
        out.write(f"==================== FILE: {p} ====================\n")
        out.write(read_docx(p))
        out.write("\n\n")

print(f"Done writing to {out_path}")
