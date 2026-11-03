# L07 — rà soát L01–L06
| Task | File/commit hiện có | Kết quả rà soát | Phần cần theo dõi |
| --- | --- | --- | --- |
| L01 | Repository LunchGo, README, `.gitignore`; nền `42a4dc7` | File nền và source B đã có trên main; Git fetch được bằng phiên hiện tại | Quyền truy cập/clone của từng thành viên chưa được xác nhận riêng |
| L02 | Vite/React/TS, package lock và cấu hình TypeScript; `42a4dc7` | Install, lint và build được xác minh chạy | Không viết lại scaffold |
| L03 | Quy ước Git/PR và commit trong README | Giữ bản ngắn theo yêu cầu người dùng, giữ nguyên commit message | Không khôi phục template riêng đã được yêu cầu bỏ |
| L04 | 9 thư mục src, alias `@/` trong TS/Vite; nền `e27eb18` | Cấu trúc và import có mặt, build phân giải được | Không viết lại phần đã xong |
| L05 | BrowserRouter, routes và layout; `e27eb18` | Router đã nối entry point; có menu/chi tiết B và các route nền cũ | Admin cũ còn ở runtime; chuẩn hóa theo phạm vi mới tại L09 |
| L06 | Store/hooks/cart, Provider, Bootstrap/SCSS; `08ee656` | Store, Provider, typed hooks và style nền đã có; lint/build đạt | Cart mới là skeleton, chưa lưu LocalStorage; phần đó thuộc L12 |

Model, seed, API client và mapper của B không bị xóa hoặc làm lại. Menu/Product hiện dùng đúng code B trong `0314a3c`, chưa đổi sang service catalog của các bước sau.

## Phần tiếp theo (sau buổi học cuối)

- L08: chốt kiến trúc trong [architecture-week1.md](architecture-week1.md), cần B/D đọc và xác nhận khi phối hợp.
- L09: chuẩn hóa Router, gỡ Admin khỏi runtime, kiểm tra deep link/History/reload theo phạm vi mới.
- L10–L11: chốt product/query contract và entry tích hợp cho D.
- L12: persistence/cart/cache và dữ liệu local lỗi/rỗng.
- L13–L14: chờ module D và điều kiện nghiệm thu, không coi đã hoàn tất ở mốc L08.

## L09 — kiểm tra điều hướng

| Ca kiểm thử trên bản build (`npm run preview`) | Kết quả |
| --- | --- |
| L09-AC01: mở trực tiếp và tải lại `/menu`, `/product/:id` với món Phở bò từ seed | Đạt |
| L09-AC02: mở Trang chủ → Thực đơn → Chi tiết qua liên kết nội bộ; dùng Back/Forward giữa thực đơn và chi tiết | Đạt |
| URL lạ, `/admin` và `/admin/settings` hiện 404; liên kết 404 về trang chủ; giỏ hàng và thanh toán vẫn mở | Đạt |

`npm run lint` và `npm run build` đều đạt. Kiểm tra nhanh PR #2: tìm kiếm, lọc, sắp xếp, phân trang và sao chép đường dẫn món hoạt động ở các ca đã thử; ID local không tồn tại hiện thông báo. Menu chưa khôi phục bộ lọc từ query (D04). Nút “Quay lại thực đơn” có thể về trang trước ngoài Menu (D06). Hai điểm này nằm ngoài ca nghiệm thu Router của L09.
