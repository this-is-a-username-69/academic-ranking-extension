# 🎓 Academic Ranking

Ứng dụng desktop dùng để quản lý và xếp hạng kết quả học tập, được xây dựng bằng Electron, React và TypeScript.

Ứng dụng cho phép nhập dữ liệu sinh viên, tính điểm trung bình (GPA) và tự động sắp xếp thứ hạng dựa trên kết quả học tập.

---

## 🚀 Giới thiệu
**Academic Ranking** là một ứng dụng desktop chuyên dụng để theo dõi tiến độ học tập. Ứng dụng giúp đơn giản hóa việc quản lý dữ liệu điểm số và tự động hóa quy trình xếp hạng.

### Tính năng chính:
* **Quản lý sinh viên:** Nhập và lưu trữ thông tin dữ liệu sinh viên dễ dàng.
* **Tính toán tự động:** Tự động tính điểm trung bình (GPA) chính xác.
* **Xếp hạng thông minh:** Hệ thống tự động sắp xếp thứ hạng dựa trên kết quả học tập từ cao xuống thấp.

---

## Công nghệ sử dụng

- Electron
- React
- TypeScript
- Node.js
- ESLint
- Prettier

---

## Yêu cầu môi trường

- Node.js >= 16
- npm >= 8

---

## Cài đặt

```bash
npm install
```

## Chạy ở môi trường phát triển

```bash
npm run dev
```

##Build ứng dụng

##Windows

```bash
npm run build:win
```

##Mac

```bash
npm run build:mac
```

##Linux

```bash
npm run build:linux
```

---

## 📁 Cấu trúc thư mục
Dự án được tổ chức theo cấu trúc chuẩn của Electron + React:

```text
src/
├── main/       # Electron main process (Xử lý hệ thống)
├── renderer/   # React UI (Giao diện người dùng)
└── preload/    # Preload scripts (Cầu nối giữa Main và Renderer)
```

## Demo Accounts

```text
Super Admin: superadmin / admin123
Admin (Thường): admin01 / admin456
Teacher: teacher01 / teacher123
Student: student01 / student123
```
