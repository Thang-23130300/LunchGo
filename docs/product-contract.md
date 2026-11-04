# Contract sản phẩm và URL — L10

B và D dùng chung kiểu `LunchProduct` trong [product.ts](../src/models/product.ts). Menu và chi tiết dùng cùng một phiên bản catalog để cùng ID luôn trả về cùng tên, danh mục và giá demo.

## Dữ liệu sản phẩm

| Trường | Quy ước |
| --- | --- |
| `id` | Chuỗi ổn định dạng `local:<uuid>`, `dummyjson:<id>` hoặc `themealdb:<idMeal>`. Dùng ID trong seed hoặc từ nguồn dữ liệu, kể cả khi đổi tên hay đổi thứ tự món. |
| `source` | `local`, `dummyjson` hoặc `themealdb`, trùng với tiền tố của `id`. |
| `name`, `category` | Chuỗi giữ Unicode và bỏ khoảng trắng đầu/cuối. Menu lọc bằng đúng giá trị `category` trong catalog. |
| `image` | URL ảnh từ nguồn. Chuỗi rỗng nếu thiếu ảnh để UI chọn ảnh dự phòng. |
| `price` | Số nguyên VND demo. Giữ giá từng món trong seed. Hai mapper API cùng dùng `35000`. |
| `ingredients` | Mảng chuỗi. Mảng rỗng nếu nguồn thiếu nguyên liệu. |
| `isAvailable` | Boolean. Mapper API đặt `true` cho dữ liệu demo, seed dùng giá trị của từng món. |
| `calories`, `nutrition` | Tùy chọn. DummyJSON cung cấp `caloriesPerServing` khi có. TheMealDB và seed hiện thiếu calories. Mapper chưa có nguồn để điền `nutrition`. |

[Mapper của B](../src/services/productMapper.ts) dùng `strCategory` cho TheMealDB và `cuisine` hoặc phần tử đầu của `mealType` cho DummyJSON. Nếu thiếu hoặc rỗng thì dùng `Khác`. Hai API cung cấp dữ liệu công thức và thiếu giá bán, tồn kho. Bản ghi thiếu tên hoặc có ID không hợp lệ được báo lỗi tại mapper.

Ví dụ lấy từ [seed của B](../src/data/fallbackCatalog.ts).

```json
{
  "id": "local:550e8400-e29b-41d4-a716-446655440001",
  "name": "Phở bò",
  "image": "https://placehold.co/600x400?text=Pho%20Bo",
  "category": "Món nước",
  "price": 45000,
  "source": "local",
  "ingredients": ["Bánh phở", "Thịt bò", "Hành", "Nước dùng"],
  "isAvailable": true
}
```

## Catalog và chi tiết món

Theo [kiến trúc L08](architecture-week1.md), catalog demo `lunchgo-week1-v1` lấy 20 món seed cố định của B. Đầu tích hợp ở L11 cung cấp `getCatalog(): Promise<LunchProduct[]>` và `getCatalogProduct(id: string): Promise<LunchProduct | null>` từ cùng catalog. Giữ nguyên ID đã phát hành khi cập nhật catalog và tăng phiên bản khi đổi dữ liệu ảnh hưởng đến kết quả mở link. Nếu bổ sung món API vào bản demo, dùng dữ liệu đã chốt trong catalog để mỗi máy nhận cùng tập món.

`/product/:id` chứa toàn bộ ID có tiền tố nguồn. Khi tạo link, mã hóa ID bằng `encodeURIComponent`. Link hiện tại chứa dấu `:` và link chứa `%3A` đều phải mở cùng món. Chi tiết tải bằng ID trong URL khi mở trực tiếp hoặc tải lại. Nếu không có ID đó trong catalog, trả `null` và hiển thị thông báo không tìm thấy. Ví dụ `/product/local%3A550e8400-e29b-41d4-a716-446655440001` mở món Phở bò giá 45.000đ với catalog trên.

## Query của `/menu`

| Key | Mặc định | Quy tắc |
| --- | --- | --- |
| `q` | Rỗng | Trim và chuẩn hóa Unicode NFC. Tìm trong tên và nguyên liệu, không phân biệt hoa thường, giữ dấu tiếng Việt. |
| `category` | Rỗng (tất cả) | Dùng đúng tên danh mục từ catalog. Giá trị lạ hoặc rỗng về mặc định. |
| `sort` | `default` | Nhận `default`, `price_asc`, `price_desc`. Giá trị lạ về mặc định. Khi bằng giá, giữ thứ tự catalog. |
| `page` | `1` | Số nguyên dương an toàn dạng thập phân. Giá trị sai về `1`. Sau khi lọc và tính số trang, giới hạn vào trang cuối nếu vượt phạm vi. Kết quả rỗng dùng trang `1`. |
| `pageSize` | `12` | Nhận `12`, `24`, `48` theo các lựa chọn của D. Giá trị lạ về `12`. Ghi vào URL khi khác mặc định để người nhận thấy cùng nhóm món trên cùng số trang. |

- Lọc trước, sắp xếp sau và phân trang cuối. Đổi `q`, `category`, `sort` hoặc `pageSize` thì về trang `1`.
- Dùng `URLSearchParams` để mã hóa. URL chuẩn chỉ ghi giá trị khác mặc định theo thứ tự trong bảng. Bỏ key lạ và lấy giá trị đầu tiên nếu key bị lặp.
- Đọc URL khi mở trang, tải lại hoặc Back/Forward. Tạo mục lịch sử khi áp dụng bộ lọc, sắp xếp hay đổi trang. Dùng `replace` để làm sạch URL sai.
- Chia sẻ path và query. Người nhận mở trên địa chỉ LunchGo của mình với cùng phiên bản catalog.

Ví dụ `/menu?q=ph%E1%BB%9F&category=M%C3%B3n+n%C6%B0%E1%BB%9Bc&sort=price_asc` mở trang 1, 12 món mỗi trang. `/menu?sort=price_desc&pageSize=24` giữ lựa chọn 24 món mỗi trang.

PR #2 đã có các điều khiển tương ứng nhưng Menu vẫn giữ bộ lọc trong state cục bộ và đang kết hợp DummyJSON trực tiếp với seed. Đồng bộ URL thuộc D04. Nối Menu và chi tiết vào catalog chung thuộc L11.
