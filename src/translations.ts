export const translations = {
  vi: {
    title: "Chuyển đổi PDF sang Word",
    subtitle: "Đảm bảo nội dung toàn vẹn",
    uploadPrompt: "Nhấn hoặc Kéo thả 1-10 file PDF vào đây",
    uploadRejection: "Định dạng file không hỗ trợ, vui lòng chọn lại file PDF!",
    fileLimit: "Chỉ hỗ trợ tối đa 10 file cùng lúc.",
    selectedFile: "Đã chọn:",
    converting: "Đang chuyển đổi và xử lý file...",
    convertBtn: "Bắt đầu chuyển đổi",
    download: "Tải về máy",
    success: "Chuyển đổi thành công!",
    developerRef: "Phát triển bởi: Ths Nguyễn Văn Thành - GV Tin học, Trường THPT Tuệ Tĩnh",
  },
  en: {
    title: "PDF to Word Converter",
    subtitle: "Ensure content integrity",
    uploadPrompt: "Click or Drag & Drop 1-10 PDF files here",
    uploadRejection: "Unsupported file format, please select valid PDF files!",
    fileLimit: "Maximum 10 files are allowed at a time.",
    selectedFile: "Selected:",
    converting: "Converting and processing files...",
    convertBtn: "Start Conversion",
    download: "Download",
    success: "Conversion successful!",
    developerRef: "Developed by: MSc Nguyen Van Thanh - IT Teacher, Tue Tinh High School",
  },
  zh: {
    title: "PDF 到 Word 转换器",
    subtitle: "确保内容完整",
    uploadPrompt: "在此点击或拖放 1-10 个 PDF 文件",
    uploadRejection: "不支持的文件格式，请重新选择有效的 PDF 文件！",
    fileLimit: "每次最多允许 10 个文件。",
    selectedFile: "已选文件:",
    converting: "正在转换和处理文件...",
    convertBtn: "开始转换",
    download: "下载文件",
    success: "转换成功！",
    developerRef: "开发人员：Ths Nguyễn Văn Thành - 信息技术老师, Trường THPT Tuệ Tĩnh",
  }
};

export type Lang = keyof typeof translations;
