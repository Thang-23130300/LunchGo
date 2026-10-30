# LunchGo

LunchGo V1.0 là dự án web thương mại điện tử bán đồ ăn trưa, phục vụ luồng chọn món, mua hàng và quản trị trong phạm vi bài tập nhóm.

## Công nghệ

- Frontend: ReactJS, TypeScript/TSX, Node.js, Redux, Hooks và Props/State.
- Giao diện: Bootstrap, SCSS, HTML5/CSS3.
- Admin: DataTables, JavaScript và jQuery; ưu tiên React wrapper, tránh thao tác trực tiếp lên DOM do React quản lý.
- Dữ liệu: TheMealDB và DummyJSON Recipes. Giá demo được lưu nội bộ bằng VND; dữ liệu công thức không phải sản phẩm bán thực.
- Lưu nghiệp vụ demo: Redux và LocalStorage trong một trình duyệt.

L02 sử dụng Vite để khởi tạo React/TypeScript. React Router, Redux Toolkit và Fetch là các công cụ bổ trợ được đề xuất cho các task sau. Không tự thêm backend hoặc dùng Supabase/MockAPI khi chưa được giảng viên cho phép.

## Repository và thành viên

- Repository: [Thang-23130300/LunchGo](https://github.com/Thang-23130300/LunchGo).
- Visibility hiện tại: public.
- Nhánh `main`: [quy tắc bảo vệ đang hoạt động](https://github.com/Thang-23130300/LunchGo/rules/26205636), chặn xóa nhánh và force-push.
- TV1: Leader, quản lý repository và module mua hàng.
- TV2: [huynhquangnghia](https://github.com/huynhquangnghia), Discovery, dữ liệu API và các module được phân công.
- TV3: [tien123-web](https://github.com/tien123-web), Admin và dữ liệu nghiệp vụ demo.

Sau khi được cấp quyền truy cập, mỗi thành viên có thể clone:

```sh
git clone https://github.com/Thang-23130300/LunchGo.git
cd LunchGo
```

## Trạng thái khởi tạo

L01 đã chuẩn bị README sơ bộ và `.gitignore` cho Node. L02 khởi tạo bộ khung Vite + React + TypeScript, kèm trang khởi động có bộ đếm để kiểm tra React state.

Việc cấp quyền và xác nhận clone của TV2/TV3 đang tạm hoãn theo quyết định của Leader. Phần này chưa được nghiệm thu và sẽ được xử lý sau.

Mô tả repository và quy tắc bảo vệ `main` đã được cấu hình trên GitHub. Clone sang một thư mục khác thành công khi repository còn rỗng; việc kiểm tra clone có nội dung cần thực hiện sau khi đưa các file lên remote.

Các file tại máy chưa được commit/push theo yêu cầu của Leader. Cần đưa README và `.gitignore` lên `main` và kiểm tra lại bản clone trước khi chốt phần L01 không bao gồm quyền truy cập đang tạm hoãn.

## Cài đặt và chạy 

Môi trường thực hiện: Node.js `24.21.0`, npm `11.19.0`. Yêu cầu Node.js `20.19+` trong dòng 20 hoặc `22.12+`, theo [hướng dẫn Vite](https://vite.dev/guide/).

Phiên bản đã cài: React/ReactDOM `19.3.1`, TypeScript `7.0.2`, Vite `8.3.5`, plugin React `6.1.2`. `package-lock.json` lưu các phiên bản cụ thể để cài đặt nhất quán.

```sh
npm install
npm run dev
```

Mở URL do Vite hiển thị trong terminal (mặc định `http://localhost:5173`). Trang khởi động hiển thị LunchGo và nút tăng bộ đếm.

Kiểm tra và build:

```sh
npm run lint
npm run build
npm run preview
```

`build` kiểm tra TypeScript trước khi xuất vào `dist/`; `preview` phục vụ bản build tại URL được in trong terminal. Khi cài lại theo đúng `package-lock.json`, dùng `npm ci`.

L02 chưa cần biến môi trường hoặc backend. Router/layout, Redux, Bootstrap/SCSS và cấu trúc module sẽ được thực hiện trong các task tương ứng.

## Quy ước commit 

Dùng Conventional Commit:

feat(auth): add email verification flow
fix(cart): correct quantity validation
refactor(product): migrate product DAO to repository
docs(readme): update installation guide
test(order): add checkout service tests
chore(deps): update maven dependencies
