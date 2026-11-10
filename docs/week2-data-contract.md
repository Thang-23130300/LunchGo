# Hợp đồng dữ liệu tuần 2

Nhánh `feature/catalog-loader-contract` bắt đầu từ `origin/main` tại `454ecc2`. Commit này chứa mốc sửa URL `3acfc9b` trong bảng phân công và PR #5 của B. Dùng chung các kiểu và action dưới đây khi làm giỏ và checkout.

| Kiểu | Nơi khai báo | Quy ước |
| --- | --- | --- |
| `LunchProduct` | [product.ts](../src/models/product.ts) | Dùng `id` có tiền tố nguồn, `name`, `image`, `price` theo VND và `isAvailable` từ cùng catalog. |
| `CartItem` | [cartSlice.ts](../src/features/cart/cartSlice.ts) | Chỉ lưu `productId` trùng `LunchProduct.id` và `quantity` là số nguyên dương. Mỗi ID có một dòng. |
| `OrderDraft` | [order.ts](../src/models/order.ts) | `customerName`, `phone` và `address` bắt buộc. `note` tùy chọn. `paymentMethod` cố định là `'cod'` mô phỏng. Giỏ là nguồn riêng, không sao chép vào draft. |

## Giỏ hàng và tổng tiền

Đọc `state.cart.items` qua `useAppSelector`. Các action hiện có của B nhận ID món dưới dạng `string`, trừ `clearCart()`.

| Action | Hành vi |
| --- | --- |
| `addToCart(productId)` | Thêm dòng số lượng 1 hoặc tăng dòng đã có thêm 1. |
| `increaseQuantity(productId)` | Tăng dòng đã có thêm 1. |
| `decreaseQuantity(productId)` | Giảm dòng khi số lượng lớn hơn 1. Ở mức 1, dùng nút xóa riêng. |
| `removeFromCart(productId)` | Xóa dòng theo ID. |
| `clearCart()` | Xóa toàn bộ giỏ. |

B chịu trách nhiệm tính dòng hàng và tổng ở W2-B05. Ghép mỗi `productId` với catalog dùng chung. Thành tiền bằng `price × quantity`. Tổng demo bằng tổng thành tiền, chưa có phí. `/cart` và `/checkout` dùng chung phép tính do B xuất để tránh lệch giá. Với ID cũ không còn trong catalog, hiển thị dòng không khả dụng để người dùng xóa và chặn xác nhận đơn. Không gán giá 0 cho ID thiếu.

Store giữ định dạng LocalStorage `lunchgo:v1:cart` với `{ version: 1, items }`. Chỉ lưu ID và số lượng. Giá và tổng được tính lại từ catalog sau khi tải trang.

## Checkout demo

D đọc cùng giỏ Redux và dùng `OrderDraft` cho form. Chặn xác nhận khi giỏ rỗng, có món không khả dụng hoặc thiếu thông tin hợp lệ. Khi xác nhận thành công, chốt bản tóm tắt món, số lượng, giá và tổng tại thời điểm đặt rồi gọi `clearCart()` đúng một lần. Giữ kết quả demo độc lập với giỏ để màn hình kết quả vẫn hiển thị sau khi xóa giỏ. Khóa thao tác gửi trong lúc xử lý để tránh xác nhận lặp. Đây là luồng COD mô phỏng.

## Phạm vi file

Leader sở hữu Router, store chung, nguồn catalog và contract. B sở hữu cart slice, thao tác trên giỏ và nút thêm món. D sở hữu form và kết quả checkout. D dùng dữ liệu và action giỏ qua contract này. Các thay đổi action hoặc schema cần được B, D và Leader thống nhất trước khi tích hợp.
