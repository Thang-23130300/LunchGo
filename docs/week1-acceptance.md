# Biên bản kiểm thử và bàn giao tuần 1 — L12–L14

Ngày 03/11/2026. Nhánh `inspect-Tuan1`, nền L11 tại `4327611` cùng thay đổi L12–L14 trong working tree. Kiểm tra trên một máy Windows với Node `24.21.0`, npm `11.19.0`, hai phiên trình duyệt ở hai origin `http://127.0.0.1:5191` (dev) và `http://127.0.0.1:4191` (preview). Hai phiên dùng cùng source và catalog `lunchgo-week1-v1`.

## L12 — Redux, LocalStorage và cache

| Ca kiểm thử | Kết quả |
| --- | --- |
| L12-AC01 — gieo một món số lượng 2, tải lại và đọc từ Redux | **PASS**. Store khôi phục đúng món và số lượng. Dispatch `clearCart()` rồi tải lại vẫn thấy giỏ rỗng. |
| Giỏ rỗng, JSON hỏng, phiên bản sai, ID trùng và số lượng không hợp lệ | **PASS**. Store khởi tạo giỏ rỗng và ghi lại cấu trúc hợp lệ khi storage khả dụng. |
| Cache catalog hỏng, cũ, rỗng hoặc bị sửa giá | **PASS**. Khôi phục 20 món đúng ID và giá từ seed. Store và catalog vẫn chạy khi đọc hoặc ghi storage bị chặn. |
| L12-AC02 — hai vùng lưu trữ độc lập | **PASS**. Giỏ tách biệt, catalog vẫn khớp. LocalStorage thuộc từng origin và trình duyệt. |

Chạy lại bằng `npm test` (5 ca). Kiểm tra reload trên trình duyệt dùng trang kiểm thử tạm gọi Redux Store của app để gieo dữ liệu, tải lại và dispatch `clearCart`. Trang `/cart` hiện là placeholder.

## L13 — chia sẻ URL

| Ca kiểm thử | Kết quả |
| --- | --- |
| Catalog trên dev và preview | **PASS**. Đối chiếu đủ 20 đường dẫn, tên và giá. |
| L13-AC01 — tìm `phở`, chọn `Món nước`, mở link ở phiên khác rồi F5 | **FAIL**. Phiên gửi thấy Phở bò và Phở gà, URL vẫn là `/menu`. Mở `/menu?q=ph%E1%BB%9F&category=M%C3%B3n+n%C6%B0%E1%BB%9Bc` ở phiên nhận vẫn hiện 12 món trên trang đầu, từ khóa rỗng và danh mục `Tất cả`. F5 cho cùng kết quả mặc định. |
| Sao chép chi tiết món rồi mở trực tiếp ở origin còn lại và F5 | **PASS**. Clipboard chứa `/product/local%3A550e8400-e29b-41d4-a716-446655440001`. Phiên nhận và F5 đều hiện Phở bò giá 45.000đ. ID không tồn tại hiện thông báo. |
| L13-AC02 — Back/Forward | **PASS** khi chuyển giữa Menu và Chi tiết. **FAIL** khi khôi phục bộ lọc lúc Back. Nút “Quay lại thực đơn” có thể mở `/checkout` nếu Thanh toán là trang trước. |
| Mở link trên máy thứ hai | **CHƯA CHẠY**. Hai origin trên cùng máy kiểm tra được tính nhất quán giữa phiên và vùng lưu trữ. Cần lặp lại trên thiết bị thứ hai. |

Minh chứng [phiên gửi sau khi lọc](evidence/l13-menu-sender.jpg), [phiên nhận sau F5](evidence/l13-menu-receiver.jpg) và [chi tiết món trên phiên nhận](evidence/l13-product-receiver.jpg).

Để chạy lại trên hai máy, mỗi máy lấy cùng phiên bản source đã bàn giao, chạy `npm ci` và `npm run dev`. Ở máy gửi, tìm `phở` và lọc `Món nước`. Chép path và query sang địa chỉ app của máy nhận. Đối chiếu hai món, F5, Back/Forward, rồi lặp lại với link Phở bò. Ghi địa chỉ hai phiên, commit, trạng thái mong đợi/thực tế và ảnh vào biên bản. Chạy thêm trên cửa sổ ẩn danh để kiểm tra phiên mới.

## L14 — tích hợp và bàn giao

| Hạng mục | Kết quả |
| --- | --- |
| L14-AC01 — dev, lint, TypeScript và build | **PASS**. Chạy dev và preview. `npm run lint`, `npm test` và `npm run build` đều đạt. Console dev và preview không ghi lỗi/cảnh báo trong các luồng đã kiểm. |
| L14-AC02 — hướng dẫn chạy và kiểm thử | **PASS**. README có cách clone, `npm ci`, lệnh dev/test/build/preview và yêu cầu môi trường. App demo chạy với cấu hình hiện có. |
| Nghiệm thu bàn giao cuối tuần | **CHỜ**. Cần L13 đạt ở máy thứ hai sau khi cập nhật URL của D và nhận biên bản D08. |

| Việc cần bàn giao hoặc xử lý tiếp | Phụ trách |
| --- | --- |
| D04 — đọc/ghi query theo contract và khôi phục bộ lọc qua F5, Back/Forward. | D |
| D06 — xử lý nút “Quay lại thực đơn” khi vào thẳng chi tiết từ đường dẫn khác. | D |
| D08 — bàn giao `docs/d-test-results.md` và minh chứng mở link/khôi phục URL. | D |
| Chạy lại L13 trên máy thứ hai, cập nhật trạng thái L14 sau khi nhận D08. | Leader |
| Tuần 2 — nối thao tác giỏ với Store khi chốt luồng mua hàng. | Leader |
