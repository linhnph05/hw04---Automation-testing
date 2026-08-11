# Kịch bản thuyết minh và hướng dẫn quay video

Video chưa được quay theo phạm vi yêu cầu của người dùng. Kịch bản dưới đây dài khoảng 6-7 phút và dùng FR-03 để minh họa.

## Chuẩn bị

1. Mở ba terminal và chạy backend, frontend web, frontend admin.
2. Kiểm tra trang web ở `http://localhost:5173`.
3. Mở terminal thứ tư tại thư mục bài tập.
4. Bật quay màn hình và thu âm tiếng Việt.

## 0:00-0:45 - Giới thiệu và bằng chứng tác giả

Chạy:

```bash
whoami
hostname
```

Lời nói gợi ý:

> Xin chào, em là Nguyễn Phan Hùng Linh, mã số sinh viên 23127081. Đây là bài HW04 về automation testing. Trên terminal em đang hiển thị lệnh whoami và hostname để chứng minh môi trường chạy bài. Trong video này em sẽ demo tính năng FR-03 quên mật khẩu và đặt lại mật khẩu bằng Playwright trên ba trình duyệt Chromium, Firefox và WebKit.

## 0:45-1:40 - Giới thiệu cấu trúc bài

Mở lần lượt:

- `test-data/fr03-cases.json`
- `tests/fr03.spec.js`
- `playwright.config.js`

Lời nói gợi ý:

> File JSON chứa 12 test case riêng biệt cho FR-03. File spec đọc dữ liệu từ JSON và tạo test động. Các test kiểm tra giao diện quên mật khẩu, API gửi OTP, đổi mật khẩu và kết quả đăng nhập sau khi đổi. Playwright config định nghĩa ba browser project. Tiêu đề HTML report luôn có Run by 23127081 và timestamp ISO.

## 1:40-2:40 - Giải thích một sửa đổi đối với code AI

Chỉ vào `FR03-TC-01` và `FR03-TC-02` trong file JSON và file spec.

> Bản code AI đầu tiên gộp việc kiểm tra độ dài OTP và các thành phần của bước một vào cùng một test case. Nếu test fail thì khó biết nguyên nhân do OTP hay do giao diện. Em tách thành hai test. TC-01 chỉ kiểm tra OTP phải có sáu chữ số. TC-02 kiểm tra dòng Bước 1 trên 2 và link Quay lại đăng nhập. Việc tách này giúp mỗi test có một mục tiêu rõ ràng và bug report dễ hiểu hơn.

Chỉ thêm vào `FR03-TC-05` nếu còn thời gian:

> Với test đổi mật khẩu thành công, em không phụ thuộc vào nội dung chính xác của hộp thoại. Em xác nhận hộp thoại, kiểm tra trang chuyển về login, mật khẩu cũ không còn đăng nhập được và mật khẩu mới đăng nhập thành công. Đây là cách kiểm tra kết quả thật thay vì chỉ kiểm tra một thông báo.

## 2:40-4:40 - Chạy FR-03 trên ba trình duyệt

Chạy từng lệnh để tạo ba report riêng:

```bash
REPORT_DIR=reports/demo/fr03-chromium RESULTS_DIR=test-results/demo-fr03-chromium npx playwright test tests/fr03.spec.js --project=chromium
REPORT_DIR=reports/demo/fr03-firefox RESULTS_DIR=test-results/demo-fr03-firefox npx playwright test tests/fr03.spec.js --project=firefox
REPORT_DIR=reports/demo/fr03-webkit RESULTS_DIR=test-results/demo-fr03-webkit npx playwright test tests/fr03.spec.js --project=webkit
```

Trong lúc chạy, giải thích:

> Mỗi trình duyệt chạy 12 test case. Một số test fail vì test đang kiểm tra đúng theo đặc tả nhưng hệ thống hiện tại có lỗi. Ví dụ OTP phải có sáu chữ số, trang phải hiển thị bước hiện tại và mật khẩu mạnh hợp lệ phải đổi được. Kết quả đã ghi nhận là 7 pass và 5 fail trên mỗi trình duyệt. Kết quả giống nhau trên cả ba browser nên các lỗi này có khả năng nằm trong hệ thống, không phải lỗi riêng của browser.

## 4:40-5:45 - Mở HTML report

Chạy:

```bash
npx playwright show-report reports/demo/fr03-chromium
```

Lời nói gợi ý:

> Trên đầu report có Run by 23127081 và timestamp ISO. Report hiển thị 12 test case của FR-03, browser Chromium, số test pass và fail. Em mở test FR03-TC-01. Test mong đợi OTP có sáu chữ số nhưng hệ thống chỉ trả về bốn chữ số. Em cũng có thể mở trace và screenshot của test fail để xem lại từng bước chạy.

## 5:45-6:30 - Bug report và kết luận

Mở `reports/BUG_REPORT.md`, sau đó mở GitHub Issue #3, #4 hoặc #7.

> Em đã tạo ba bug liên quan đến FR-03: OTP chỉ có bốn chữ số, giao diện thiếu thông tin bước và một số điều khiển, và mật khẩu mạnh hợp lệ vẫn bị từ chối. Em không tạo lại cùng một issue cho từng browser vì nguyên nhân lỗi giống nhau. Mỗi issue có requirement, bước tái hiện, expected, actual và screenshot trang GitHub Issue. Qua bài này, em thấy AI giúp tạo ý tưởng và bản nháp nhanh, nhưng người kiểm thử vẫn phải đọc đặc tả, chạy test thật, sửa assertion chưa đúng và chịu trách nhiệm cho kết quả cuối cùng.

## Checklist trước khi đăng YouTube

- Video dài ít nhất 5 phút.
- Có giọng nói tiếng Việt của sinh viên.
- Có `whoami` và `hostname` rõ ràng.
- Demo script `tests/fr03.spec.js` chạy end-to-end trên ba browser.
- Có mở HTML report với Student ID và timestamp.
- Có giải thích ít nhất một sửa đổi code AI.
- Đăng ở chế độ **Unlisted**, sau đó thêm URL vào README và báo cáo.
