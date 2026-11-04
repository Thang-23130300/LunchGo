# LunchGo

LunchGo V1.0 là dự án web đồ ăn trưa. Kiến trúc tuần 1 chốt tại L08: React + fake API + dữ liệu local, chỉ public-user, không làm Admin.

## Công nghệ

- Frontend: ReactJS, TypeScript/TSX, Node.js, Redux, Hooks và Props/State.
- Giao diện: Bootstrap, SCSS, HTML5/CSS3.
- Dữ liệu demo: catalog `lunchgo-week1-v1` gồm 20 món seed dùng chung cho thực đơn và chi tiết. Các client TheMealDB và DummyJSON Recipes phục vụ việc nhập dữ liệu. Giá demo dùng VND.
- Redux giữ state giỏ hàng. LocalStorage lưu giỏ và cache catalog theo trình duyệt và origin. Link chia sẻ mang đường dẫn và query, còn mỗi máy chạy cùng phiên bản catalog để đối chiếu kết quả.

L02 sử dụng Vite để khởi tạo React/TypeScript; L05 sử dụng React Router `8.5.1` để điều hướng. L06 dùng Redux Toolkit `2.13.0`, React Redux `9.3.1`, Bootstrap `5.3.8` và Sass `1.107.1`. Không tự thêm backend hoặc dùng Supabase/MockAPI khi chưa được giảng viên cho phép.

## Repository và thành viên

- Repository: [Thang-23130300/LunchGo](https://github.com/Thang-23130300/LunchGo).
- Visibility hiện tại: public.
- Nhánh `main`: [quy tắc bảo vệ đang hoạt động](https://github.com/Thang-23130300/LunchGo/rules/26205636), chặn xóa nhánh và force-push.
- Leader: kiến trúc, Router/Store, contract, tích hợp và nghiệm thu.
- B: [huynhquangnghia](https://github.com/huynhquangnghia), đã đưa model/client/mapper/seed và Menu/Product lên PR #1.
- D: tiếp nhận phần B, hoàn thiện Search/Filter/Sort/Page/Share/History theo bảng phân công mới; không giao Admin.

Sau khi được cấp quyền truy cập, mỗi thành viên có thể clone:

```sh
git clone https://github.com/Thang-23130300/LunchGo.git
cd LunchGo
```

## Tiến độ tuần 1

Phần B đã có trong PR #1. PR #2 đã đưa giao diện thực đơn và chi tiết món của D vào `main`.

- [L07: đối chiếu L01–L06 và phần còn thiếu](docs/leader-test-results.md).
- [L08: kiến trúc React + fake API + local, URL state và file sở hữu](docs/architecture-week1.md).
- [L10: contract sản phẩm và URL](docs/product-contract.md).
- [L11: tích hợp thực đơn và chi tiết món](docs/discovery-integration.md).
- [L12–L14: biên bản kiểm thử, nghiệm thu và việc cần bàn giao](docs/week1-acceptance.md).

## Cài đặt và chạy 

Môi trường thực hiện: Node.js `24.21.0`, npm `11.19.0`. Yêu cầu Node.js `20.19+` trong dòng 20 hoặc `22.12+`, theo [hướng dẫn Vite](https://vite.dev/guide/).

Phiên bản đã cài: React/ReactDOM `19.3.1`, TypeScript `7.0.2`, Vite `8.3.5`, plugin React `6.1.2`. `package-lock.json` lưu các phiên bản cụ thể để cài đặt nhất quán.

```sh
npm ci
npm run dev
```

Mở URL do Vite hiển thị trong terminal (mặc định `http://localhost:5173`). Dùng menu để chuyển giữa các trang LunchGo.

Kiểm tra và build:

```sh
npm run lint
npm test
npm run build
npm run preview
```

`npm ci` cài theo `package-lock.json`. `npm test` kiểm tra lưu và khôi phục giỏ, cache và trường hợp storage bị chặn. `build` kiểm tra TypeScript trước khi xuất vào `dist/`. `preview` chạy bản build tại URL được in trong terminal.

Ứng dụng hiện chưa cần biến môi trường hoặc backend.

## Store và giao diện

- Store: `src/app/store.ts`; `Provider` bọc ứng dụng tại `src/main.tsx`.
- Dùng `useAppDispatch` và `useAppSelector` từ `src/app/hooks.ts`; `RootState`/`AppDispatch` được suy ra từ store.
- Cart slice lưu `productId` và `quantity`. Store khôi phục giỏ từ LocalStorage khi mở app và lưu khi giỏ thay đổi. Dữ liệu lỗi hoặc sai phiên bản được khởi tạo lại. Giao diện thao tác mua hàng vẫn ở mốc placeholder.
- SCSS entry: `src/styles/main.scss`, nạp Bootstrap và reset. Chỉnh biến màu tại `src/styles/_variables.scss`; Bootstrap và CSS variables `--lunchgo-*` dùng cùng bộ màu.

## Điều hướng 

| Đường dẫn | Trang |
| --- | --- |
| `/` | Trang chủ |
| `/menu` | Thực đơn |
| `/product/:id` | Chi tiết món; nhận `id` từ URL |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `*` | Trang 404 cho đường dẫn không tồn tại |

`BrowserRouter` xử lý URL và nút Back/Forward của trình duyệt. Liên kết nội bộ dùng React Router. Cart/checkout còn là placeholder; `/admin` và các đường dẫn con trả về trang 404.

Khi triển khai lên hosting, cần cấu hình SPA fallback về `index.html` để mở hoặc refresh URL con. Vite dev/preview hỗ trợ việc này khi chạy tại máy.

## Cấu trúc source 

- `src/app`: cấu hình ứng dụng; `src/features`: các module nghiệp vụ.
- `src/components`: component dùng chung; `src/pages`: các trang.
- `src/models`: kiểu dữ liệu; `src/services`: kết nối và xử lý dữ liệu.
- `src/styles`: style dùng chung; `src/utils`: hàm tiện ích; `src/data`: dữ liệu demo/fallback.

Các thư mục mới dùng `.gitkeep` để Git lưu được khi còn trống. Alias `@/` trỏ tới `src/`, ví dụ `import App from '@/App.tsx'`; đã cấu hình đồng bộ trong TypeScript và Vite.

## Quy ước Git và PR 

- `main` là nhánh ổn định; thay đổi qua PR, không push trực tiếp lên `main`.
- Tên nhánh: `feat/<task>-<ten>`, `fix/<task>-<ten>` hoặc `docs/<task>-<ten>`, ví dụ `feat/l04-folder-structure`.
- Mỗi PR chỉ làm một task; không tự sửa code của thành viên khác ngoài phạm vi đã thống nhất.
- PR ghi Task ID, thay đổi chính, kết quả kiểm thử và ảnh giao diện nếu có. Khi đổi code, chạy `npm run lint` và `npm run build`; mục không áp dụng cần ghi lý do.
- Không commit `node_modules/`, `dist/`, `.env` thật, token hoặc secret. Giữ `package-lock.json`; `.env.example` chỉ chứa giá trị mẫu.

## Quy ước commit 

Dùng Conventional Commit:

feat(auth): add email verification flow
fix(cart): correct quantity validation
refactor(product): migrate product DAO to repository
docs(readme): update installation guide
test(order): add checkout service tests
chore(deps): update maven dependencies
