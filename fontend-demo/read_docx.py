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

files = [
    "BÁO CÁO XÂY DỰNG MA TRẬN NĂNG LỰC SỐ THEO VỊ TRÍ.docx",
    "giaotrinh-linhvuc1.docx",
    "giaotrinh-linhvuc2.docx",
    "giaotrinh-linhvuc3.docx",
    "giaotrinh-linhvuc4.docx",
    "giaotrinh-linhvuc5.docx",
    "khung-chuong-trinh-15-khoa-digcomp.docx"
]

base_dir = r"D:\Program Files\QLNS\QLNS\project_demo\dung_bam_vao_day"
for f in files:
    full_path = os.path.join(base_dir, f)
    print(f"=== {f} ===")
    content = read_docx(full_path)
    print(content)
    print("\n" + "="*50 + "\n")
