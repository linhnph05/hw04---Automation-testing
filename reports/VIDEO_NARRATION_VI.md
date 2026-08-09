# Kịch bản thuyết minh và hướng dẫn quay video

Video chưa được quay theo phạm vi yêu cầu của người dùng. Kịch bản dưới đây dài khoảng 6-7 phút và dùng FR-09 để minh họa.

## Chuẩn bị

1. Mở ba terminal và chạy backend, frontend web, frontend admin.
2. Kiểm tra trang web ở `http://localhost:5173`.
3. Mở terminal thứ tư tại thư mục bài tập.
4. Bật quay màn hình, có thu âm tiếng Việt.

## 0:00-0:45 - Giới thiệu và bằng chứng tác giả

Chạy:

```bash
rtk proxy whoami
rtk proxy hostname
```

Lời nói gợi ý:

> Xin chào, em là Nguyễn Phan Hùng Linh, mã số sinh viên 23127081. Đây là bài HW04 về automation testing. Trên terminal em đang hiển thị lệnh whoami và hostname để chứng minh môi trường chạy bài. Trong video này em sẽ demo tính năng FR-09 mã giảm giá bằng Playwright trên ba trình duyệt Chromium, Firefox và WebKit.

## 0:45-1:40 - Giới thiệu cấu trúc bài

Mở lần lượt:

- `test-data/fr09-cases.json`
- `tests/fr09.spec.js`
- `playwright.config.js`

Lời nói gợi ý:

> File JSON chứa 12 test case riêng biệt, không hardcode mảng dữ liệu trong script. File spec đọc dữ liệu này và tạo test động. Em dùng nhiều kiểu assertion như kiểm tra status code, nội dung, URL, object trả về và trạng thái dữ liệu. Playwright config định nghĩa ba browser project. Tiêu đề HTML report luôn có Run by 23127081 và timestamp ISO.

## 1:40-2:30 - Giải thích một sửa đổi đối với code AI

Chỉ vào test `FR09-TC-09`.

> Bản code AI đầu tiên tìm chữ Đăng nhập trên toàn trang để kết luận guest bị từ chối. Nhưng navbar luôn có link Đăng nhập, nên assertion đó có thể pass giả. Em phát hiện vấn đề sau lần chạy Chromium. Em sửa lại để kiểm tra URL phải chuyển thật sự sang trang login và không được có panel áp dụng coupon thành công. Em cũng bỏ user_id khỏi các request bình thường vì backend phải lấy danh tính từ JWT.

## 2:30-4:30 - Chạy trên ba trình duyệt

Chạy từng lệnh để tạo ba report riêng:

```bash
rtk proxy env REPORT_DIR=reports/demo/fr09-chromium RESULTS_DIR=test-results/demo-fr09-chromium npx playwright test tests/fr09.spec.js --project chromium
rtk proxy env REPORT_DIR=reports/demo/fr09-firefox RESULTS_DIR=test-results/demo-fr09-firefox npx playwright test tests/fr09.spec.js --project firefox
rtk proxy env REPORT_DIR=reports/demo/fr09-webkit RESULTS_DIR=test-results/demo-fr09-webkit npx playwright test tests/fr09.spec.js --project webkit
```

Trong lúc chạy, giải thích:

> Một số test fail là kết quả mong đợi vì test đang bám theo đặc tả đúng. Ví dụ SAVE10 phải giảm 10 phần trăm, đơn đúng bằng minimum phải được chấp nhận, và guest không được áp dụng coupon. Cả ba trình duyệt đều cho kết quả 7 pass và 5 fail, nên đây không phải lỗi riêng của browser.

## 4:30-5:40 - Mở HTML report

Chạy:

```bash
rtk proxy npx playwright show-report reports/demo/fr09-chromium
```

Lời nói gợi ý:

> Trên đầu report có Run by 23127081 và timestamp ISO. Report hiển thị 12 test case, browser Chromium, số pass và fail. Em mở test FR09-TC-01. Expected discount là 40.000 đồng nhưng actual là âm 3.600.000 đồng, cho thấy công thức phần trăm bị sai. Report cũng lưu trace và screenshot để điều tra.

## 5:40-6:30 - Bug report và kết luận

Mở `reports/BUG_REPORT.md` và GitHub Issue BUG-04 hoặc BUG-06.

> Em đã gom các lần fail giống nhau trên ba browser thành tám root-cause bug thay vì tạo issue trùng lặp. Mỗi issue có requirement, bước tái hiện, expected, actual và screenshot thật từ HTML report. Qua bài này, em thấy AI giúp tạo ý tưởng và bản nháp nhanh, nhưng người kiểm thử phải đọc đặc tả, chạy thật, phát hiện false positive và chịu trách nhiệm cho assertion cuối cùng.

## Checklist trước khi đăng YouTube

- Video dài ít nhất 5 phút.
- Có giọng nói tiếng Việt của sinh viên.
- Có `whoami` và `hostname` rõ ràng.
- Có một script chạy end-to-end trên ba browser.
- Có mở HTML report với Student ID và timestamp.
- Có giải thích ít nhất một sửa đổi code AI.
- Đăng ở chế độ **Unlisted**, sau đó thêm URL vào README và báo cáo.
