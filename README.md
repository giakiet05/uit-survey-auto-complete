# UIT Survey Auto Complete

Browser extension tự động điền khảo sát môn học UIT

## Auto-fill Logic

Extension sẽ tự động chọn:

- **Tỷ lệ thời gian lên lớp:** >80%
- **Tự đánh giá chuẩn đầu ra:** Trên 90%
- **Đánh giá giảng viên:** Điểm 4 (cao nhất) cho tất cả câu
- **Ý kiến khác:** Bỏ trống

## Cài đặt

### Cách 1: Từ Release

1. Tải file `.zip` từ [Releases](../../releases/latest)
2. Giải nén file
3. Mở Chrome → Vào `chrome://extensions` (với các trình duyệt khác có thể sẽ khác một tí)
4. Bật **Developer mode** (góc trên bên phải)
5. Click **Load unpacked**
6. Chọn folder vừa giải nén
7. Extension sẵn sàng để dùng!

### Cách 2: Từ Source Code

```bash
# Clone repo
git clone https://github.com/giakiet05/uit-survey-auto-complete.git
cd uit-survey-auto-complete

# Load extension
# 1. Mở chrome://extensions
# 2. Bật Developer mode
# 3. Load unpacked → Chọn folder này
```

> [!IMPORTANT]
> **QUAN TRỌNG: KHÔNG XÓA FOLDER EXTENSION!**
> 
> Extension hoạt động bằng cách trỏ trực tiếp đến folder trên máy. Nếu xóa/di chuyển folder, extension sẽ ngưng hoạt động. Hãy giữ folder ở vị trí cố định.

## Hướng dẫn sử dụng

### Batch Mode (Điền tất cả khảo sát)

1. Vào trang danh sách khảo sát: `https://student.uit.edu.vn/sinhvien/phieukhaosat`
2. Click icon extension
3. Bấm **"Bắt đầu tự động điền"**
4. Extension sẽ tự động:
   - Tìm tất cả khảo sát chưa hoàn thành
   - Lần lượt điền từng khảo sát
   - **Tự động Submit**
   - Quay về danh sách và tiếp tục khảo sát tiếp theo
5. Khi hoàn thành tất cả → Hiện thông báo

### Single Mode (Điền 1 khảo sát)

1. Vào trang khảo sát bất kỳ trên `survey.uit.edu.vn`
2. Click icon extension trên toolbar
3. Bấm **"Bắt đầu tự động điền"**
4. Extension sẽ tự động:
   - Điền tất cả câu hỏi với điểm cao nhất
   - Chuyển qua các trang
   - **DỪNG trước nút Gửi** để bạn kiểm tra
5. Kiểm tra lại → Bấm **Gửi** bằng tay

### Dừng Extension

1. Click icon extension (khi đang chạy, icon sẽ hiển thị badge **"RUN"**)
2. Bấm nút **"Dừng lại"** (màu đỏ)
3. Extension sẽ dừng ngay và quay về trang danh sách

## Lưu ý quan trọng

- **KHÔNG** thao tác với tab khi extension đang chạy

- **KHÔNG** đóng tab cho đến khi extension hoàn thành

- Icon extension hiển thị **"RUN"** khi đang hoạt động
