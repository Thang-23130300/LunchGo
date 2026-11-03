# Tích hợp thực đơn và chi tiết món — L11

Router chung import `MenuPage` và `ProductPage` từ `@/features/discovery`, rồi gắn vào `/menu` và `/product/:id`. Hai trang đọc cùng catalog `lunchgo-week1-v1` từ 20 món seed của B theo [contract L10](product-contract.md). Menu gọi `getCatalog()`. Chi tiết gọi `getCatalogProduct(id)` với ID đã được React Router giải mã. ID nằm ngoài catalog hiện tại hiển thị thông báo không tìm thấy, kể cả ID từng lấy từ API trực tiếp.

| Phụ trách | File và phạm vi |
| --- | --- |
| Leader | `src/app/routes.tsx`, `src/app/store.ts`, `src/services/catalogService.ts`. Phụ trách route chung, Store và catalog tích hợp. |
| D | `src/features/discovery/index.ts`, `src/pages/MenuPage.tsx`, `src/pages/ProductPage.tsx`. Phụ trách export hai trang và UI tìm kiếm, lọc, sắp xếp, phân trang, URL và chia sẻ. |
| B | `src/models/product.ts`, `src/data/fallbackCatalog.ts`, `src/services/productMapper.ts` và hai API client. Phụ trách model, seed và chuẩn hóa dữ liệu nguồn. |

Module Discovery dùng Router và Store của ứng dụng. Nếu phát hiện lệch contract, ghi đường dẫn hoặc ID, bước tái hiện, kết quả mong đợi và file liên quan để người phụ trách xử lý. Đồng bộ query của Menu thuộc D04. Cart persistence và cache thuộc L12.

Kiểm tra L11 trên bản build. Thực đơn hiển thị 20 món qua hai trang. Tên, danh mục và giá khớp với chi tiết ở 5 món đã thử. Link mở được trực tiếp và sau khi tải lại. ID ngoài catalog hiện thông báo. Đã kiểm tra tìm kiếm, lọc, sắp xếp và phân trang trên catalog chung.
