# Kiến trúc tuần 1 — L08

## Phạm vi đã chốt

React + TypeScript, React Router, Redux Toolkit, fake API và dữ liệu local. Tuần 1 chỉ có public-user, không giao chức năng Admin. Không bổ sung backend hoặc yêu cầu thao tác “swap & merge”.

Tài liệu này là quyết định kiến trúc ở mốc L08, chưa phải xác nhận các bước L09 trở đi đã được triển khai. Runtime hiện vẫn là nền L06 và phần B đã có trên main; route Admin cũ sẽ được gỡ khi làm L09.

## Một catalog dùng chung

- Menu và chi tiết phải dùng cùng một catalog với ID, giá demo và phiên bản dữ liệu ổn định.
- Tận dụng model, mapper, API client và seed đã có của B; không tạo thêm client hoặc nguồn dữ liệu trùng lặp.
- Không tự trộn dữ liệu API trực tiếp khác nhau theo từng máy rồi coi là cùng catalog.
- Giá là VND demo; dữ liệu công thức không phải sản phẩm bán thật. Không tự suy ra giá thật hoặc calories bị thiếu.
- Model/ID/version và interface service chung sẽ được chốt ở L10; việc nối module UI thực hiện ở L11. Hai phần này chưa áp dụng trong working tree mốc L08.

## React root, Router, URL và local

| Thành phần | Vai trò |
| --- | --- |
| `createRoot` | Mount cây React; không phải nơi lưu trạng thái chia sẻ |
| `BrowserRouter` | Quản lý route và browser History/Location; không viết custom history nếu Router đã xử lý |
| URL `/menu` + query | Lưu trạng thái tìm kiếm/lọc để người nhận mở lại; chi tiết query contract chốt ở L10 |
| URL `/product/:id` | Định danh món ổn định, không phụ thuộc trang trước đã được mở |
| Redux | State runtime như giỏ hàng |
| LocalStorage | Lưu dữ liệu cần giữ sau reload trong một origin; phần persistence triển khai và kiểm thử ở L12 |

Base route là `/`, `/menu`, `/product/:id` và `*` cho 404. Cart/checkout hiện là placeholder public của nền cũ, chưa triển khai nghiệp vụ mới tại L08. Chuẩn hóa route, deep link, Back/Forward và reload thực hiện ở L09.

Chia sẻ **path + query**, rồi mở bằng origin của app trên máy nhận cùng source/catalog. `localhost` của máy A không phải địa chỉ app trên máy B. LocalStorage không đồng bộ giữa máy hoặc origin; không dùng nó hay navigation state làm nguồn duy nhất của link chia sẻ.

Hosting sau này cần SPA fallback về `index.html` để mở trực tiếp URL con.

## Quyền sửa file và phối hợp

| Phụ trách | Phạm vi |
| --- | --- |
| Leader | Root, Router/Store, layout dùng chung, kiến trúc, contract, tích hợp và nghiệm thu |
| B | Model, seed, hai API client và mapper hiện có; chỉ sửa khi có lỗi/contract được trao đổi |
| D | Menu/Product và UI Search/Filter/Sort/Page/Share/History sau khi nhận contract |

D tiếp nhận giao diện B hiện có, không viết lại toàn bộ hoặc tạo API client trùng. Không tự sửa chéo Router/Store/model chung; nếu interface sai, trao đổi file và vấn đề cụ thể với Leader trước khi sửa. Các exports/entry module sẽ được thống nhất ở L11.

B/D chưa xác nhận đã đọc tài liệu trong phiên này. L13/L14 chỉ nghiệm thu sau khi nhận module D và bằng chứng; mốc L08 không bao gồm code hay kết quả nghiệm thu của các task đó.
