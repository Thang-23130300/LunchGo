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

`npm ci` cài theo `package-lock.json`. `npm test` kiểm tra lưu giỏ, cache, loader catalog và tổng tiền dùng chung. `build` kiểm tra TypeScript trước khi xuất vào `dist/`. `preview` chạy bản build tại URL được in trong terminal.

### API dữ liệu mẫu

Chạy JSON Server `1.0.0-beta.15` trong một terminal riêng. Phiên bản được cố định trong `package.json` và `package-lock.json`.

```sh
npm run api
```

API phục vụ `db.json` tại `http://127.0.0.1:3001`. Chạy giao diện bằng `npm run dev` trong terminal khác.

| Collection | URL | Dữ liệu mẫu |
| --- | --- | --- |
| products | `/products` | 48 sản phẩm — 36 món ăn và 12 nước uống |
| categories | `/categories` | 10 danh mục |
| optionGroups | `/optionGroups` | 3 nhóm tùy chọn |
| options | `/options` | 7 lựa chọn |

Toàn bộ 48 sản phẩm được nhập từ sheet **Nhập dữ liệu**, dòng 6–53 của `LunchGo_Dataset_V1.xlsx`. ID sản phẩm giữ nguyên `FOOD001`–`FOOD036` và `DRINK001`–`DRINK012`. Mười danh mục lấy từ sheet **Phân công & hướng dẫn**, dòng 20–29, giữ ID `CAT01`–`CAT10` và đổi tên theo quy ước ASCII đã thống nhất. Giá cơ bản dùng VND. Ba nhóm và bảy lựa chọn đã nhập cho `FOOD015`, `FOOD016` được giữ trong API, với giá thêm đã nhân 1.000 theo xác nhận của người cung cấp dữ liệu.

Quan hệ dữ liệu là `products.categoryId → categories.id`, `optionGroups.productId → products.id` và `options.groupId → optionGroups.id`. Có thể kiểm tra `/products/FOOD015`, `/optionGroups?productId=FOOD016` và `/options?groupId=GRP-FOOD016-02`.

`image` là đường dẫn `/products/<tên danh mục>/<tên file ảnh>`, tương ứng với file trong `src/assets/products/`. Toàn bộ 48 ảnh đã được kiểm tra tên file và định dạng JPG/PNG theo Excel. `imageFileName` giữ chính xác tên và đuôi ảnh gốc, `imageSourceUrl` giữ nguồn ảnh trong Excel. `ingredients` là mảng rỗng vì Excel chưa có cột nguyên liệu riêng. `Có`/`Không` được chuyển thành boolean cho `isAvailable` và `isFeatured`.

### Thư mục ảnh sản phẩm

Ảnh nằm trong `src/assets/products/<tên danh mục>/`, dùng tên danh mục ASCII trong `categories` và giữ nguyên tên file ảnh theo Excel.

| Danh mục | categoryId | Số ảnh |
| --- | --- | --- |
| Com | CAT01 | 5 |
| Bun | CAT02 | 4 |
| PhoHuTieu | CAT03 | 4 |
| Mi | CAT04 | 4 |
| BanhMi | CAT05 | 3 |
| Cuon | CAT06 | 4 |
| Banh | CAT07 | 4 |
| Chao | CAT08 | 4 |
| Salad | CAT09 | 4 |
| DoUong | CAT10 | 12 |

Ví dụ `FOOD015` có ảnh `src/assets/products/PhoHuTieu/Pho_ga.jpg`, trường `image` là `/products/PhoHuTieu/Pho_ga.jpg`. Thêm hoặc thay ảnh trong đúng thư mục danh mục, sau đó đặt `image` theo đường dẫn đó. JSON Server phục vụ `src/assets` qua tùy chọn `--static src/assets`. Component `DishImage` dùng `import.meta.glob` để Vite đưa các ảnh vào bản build và phân giải URL tương ứng trên giao diện. Build lại giao diện sau khi thêm ảnh để đưa file mới vào bản triển khai.

`db.json` là nguồn dữ liệu cho API. Catalog được lấy qua `src/api/products.ts`, nạp vào Redux bởi `createCatalogLoader` hiện có. Menu, chi tiết món, giỏ và Checkout dùng chung dữ liệu trong Redux. Router dùng URL `/product/:id` với ID Excel như `FOOD015`, `FOOD016`. `src/data/options.json` và `src/data/optionGroups.json` hiện vẫn cung cấp dữ liệu tùy chọn cho giao diện.

Home lấy danh mục từ `/categories` qua cùng loader và Redux, hiển thị đủ 10 danh mục. Khu vực nổi bật hiển thị tối đa 4 sản phẩm có `isFeatured: true` và `isAvailable: true`, theo thứ tự API. Bốn món được chọn là `FOOD001`, `FOOD006`, `FOOD010`, `FOOD013`. Thẻ món hiển thị tên, mô tả, giá và ảnh từ API. Tìm kiếm và liên kết danh mục mở Menu với query tương ứng, liên kết món mở `/product/:id`. Sản phẩm và danh mục có trạng thái tải/lỗi riêng, nút thử lại chỉ nạp lại phần bị lỗi.

Menu dùng toàn bộ sản phẩm từ `/products` và danh mục từ `/categories`. Bộ lọc đối chiếu `categoryId` để theo tên danh mục hiện tại, kể cả danh mục chưa có món; khi API danh mục bị lỗi, dùng tên danh mục trong sản phẩm. Tìm kiếm theo tên hoặc nguyên liệu, không phân biệt chữ hoa/thường và chuẩn hóa Unicode tiếng Việt. Sắp xếp theo giá, phân trang 12/24/48 món và tổng số kết quả được tính từ dữ liệu hiện có. Thay tìm kiếm, danh mục, sắp xếp hoặc số món mỗi trang sẽ về trang 1. URL lưu bộ lọc, giữ được khi F5, Back/Forward và quay lại từ chi tiết món. Sau khi sửa dữ liệu API, tải lại trang để nạp dữ liệu mới; trang vượt quá tổng số trang sẽ tự chuyển về trang cuối hợp lệ.

Khi mở hoặc F5 trang, Router hiển thị Loading trong lúc chờ API. Home báo lỗi sản phẩm và danh mục riêng; Menu vẫn dùng được sản phẩm nếu API danh mục lỗi và giữ danh mục đang chọn trong URL để thử lại. Nút thử lại bị khóa và hiển thị trạng thái đang tải cho tới khi hoàn tất. Thực đơn trống được phân biệt với tìm kiếm không có kết quả; trường hợp không có kết quả có nút xóa bộ lọc. Chi tiết món phân biệt lỗi API với ID không tồn tại, luôn có liên kết quay lại thực đơn.

### API Service và type dùng chung

Tạo tệp `.env.local` tại thư mục gốc dự án và đặt địa chỉ JSON Server. Khởi động lại Vite sau khi sửa biến môi trường.

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:3001
```

Khi biến chưa được đặt, Service dùng `http://127.0.0.1:3001`. Các hàm trong `@/api` trả về Promise và nhận `AbortSignal` tùy chọn để hủy yêu cầu. GET chi tiết trả về `null` khi server trả HTTP 404. Các lỗi HTTP khác, lỗi mạng và JSON lỗi được chuyển cho bên gọi xử lý. Loader catalog hiện hiển thị trạng thái lỗi và hỗ trợ thử lại khi API chưa chạy.

```ts
import { getProducts, getProductById, getCategories, getCategoryById } from '@/api'
import type { Product, Category, OptionGroup, Option, SelectedOption, CartItem, Order } from '@/models'

const products = await getProducts()
const product = await getProductById('FOOD015')
const categories = await getCategories()
const category = await getCategoryById('CAT03')
```

Type chuẩn được định nghĩa trong `src/models/` và export tại `src/models/index.ts`. `Product` dùng các trường sẵn có của catalog cùng metadata tùy chọn từ Excel. `CartItem` lưu `productId`, `quantity`, `itemId` và `selectedOptionIds`, tương thích giỏ LocalStorage cũ. `SelectedOption` là bản chụp ID, tên và giá thêm của lựa chọn tại thời điểm đặt hàng. `Order` chứa `orderId`, thông tin người nhận, các `OrderItem`, tổng tiền, phương thức thanh toán và thời gian tạo. Các tên cũ `LunchProduct`, `CustomizationOption`, `ConfirmedOrder`, `OrderDraftItem`, `OrderDraftOption` tham chiếu về type chuẩn để các import hiện có tiếp tục dùng được.

### L01 — Authentication Service

`src/services/authService.ts` cung cấp `authService.login`, `authService.getMe` và `authService.refresh`, dùng [DummyJSON Authentication](https://dummyjson.com/docs/auth). Tài khoản demo là **emilys** / **emilyspass**. Tên `lunchgo.demo` trong bản thiết kế chỉ là dữ liệu minh họa. L01 cung cấp Service và type dùng chung; L02 bên dưới tích hợp Redux và lưu phiên. Giao diện đăng nhập sẽ dùng các action và selector này.

Auth dùng `https://dummyjson.com` riêng với JSON Server của sản phẩm/đơn hàng. Có thể đặt `VITE_AUTH_API_BASE_URL=https://dummyjson.com` trong `.env.local`; mặc định đã dùng địa chỉ này. Khởi động lại Vite sau khi đổi biến môi trường.

```ts
import { authService, AuthError } from '@/services/authService'
import type { UserProfile, AuthSession, AuthTokens } from '@/models'

const session: AuthSession = await authService.login({
  username: 'emilys',
  password: 'emilyspass',
  expiresInMins: 30,
})
const profile: UserProfile = await authService.getMe(session.tokens.accessToken)
const tokens: AuthTokens = await authService.refresh({
  refreshToken: session.tokens.refreshToken,
  expiresInMins: 30,
})
// Dùng tokens.accessToken mới cho các lần gọi getMe tiếp theo.
```

`login` gọi `POST /auth/login`, trả về `{ user, tokens }`. `getMe` gọi `GET /auth/me` với Bearer access token, trả về hồ sơ công khai đã chuẩn hóa. `refresh` gọi `POST /auth/refresh`, trả về cặp token mới. Việc làm mới phiên do bên gọi chủ động thực hiện; Service không tự đăng nhập lại. Các hàm nhận `AbortSignal` tùy chọn ở tham số cuối. Request quá 15 giây trả lỗi `TIMEOUT`; hủy từ bên gọi giữ nguyên lý do hủy.

`UserProfile`, `LoginCredentials`, `AuthTokens`, `RefreshTokenRequest`, `AuthSession` và `AuthErrorCode` nằm tại `src/models/auth.ts`, export qua `@/models`. `AuthError` có `code`, `message` tiếng Việt và `status` khi có HTTP response. Bên gọi dùng `error instanceof AuthError` để xử lý `INVALID_INPUT`, `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `NETWORK_ERROR`, `TIMEOUT`, `HTTP_ERROR` và `INVALID_RESPONSE`. Service kiểm tra cấu trúc phản hồi trước khi trả dữ liệu; hồ sơ không chứa mật khẩu hoặc dữ liệu ngân hàng mà DummyJSON trả kèm. Service không tự ghi token/mật khẩu vào LocalStorage và không có API đăng ký tài khoản.

### L02 — Redux Auth và phiên đăng nhập

`src/features/auth/authSlice.ts` quản lý `user`, `tokens`, `status`, `error` và yêu cầu đang chạy trong `state.auth`. Các trạng thái là `unauthenticated`, `idle` (có token chờ xác nhận), `loading`, `authenticated` và `error` (khôi phục phiên gặp lỗi tạm thời). Lỗi được giữ dưới dạng dữ liệu `{ code, message, status? }`, tương thích Redux.

Module khác dùng selector để lấy tài khoản và ID; không đọc hoặc tin hồ sơ người dùng từ LocalStorage:

```ts
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  login, logout, restoreSession, clearAuthError,
  selectCurrentUser, selectCurrentUserId, selectIsAuthenticated,
  selectAuthLoading, selectAuthError, selectIsRestoringSession,
} from '@/features/auth/authSlice'

// Trong component React:
const dispatch = useAppDispatch()
const currentUser = useAppSelector(selectCurrentUser)
const currentUserId = useAppSelector(selectCurrentUserId) // number | null
const isAuthenticated = useAppSelector(selectIsAuthenticated)
const loading = useAppSelector(selectAuthLoading)
const error = useAppSelector(selectAuthError)

await dispatch(login({ username: 'emilys', password: 'emilyspass' }))
dispatch(clearAuthError())
dispatch(logout())
// Khi khôi phục phiên bị lỗi mạng, có thể thử lại:
await dispatch(restoreSession())
```

`main.tsx` tự dispatch `restoreSession()` khi mở/F5 ứng dụng. Store nạp token qua `src/features/auth/authStorage.ts`, gọi `/auth/me` để xác nhận hồ sơ, chỉ sau đó cung cấp `currentUserId` và trạng thái đã đăng nhập. Nếu access token không hợp lệ, thử `/auth/refresh` đúng một lần rồi gọi lại `/auth/me`. Refresh token không hợp lệ hoặc dữ liệu phản hồi sai sẽ xóa phiên; lỗi mạng/timeout/lỗi dịch vụ giữ token để thử khôi phục lại, đồng thời `currentUserId` vẫn là `null` cho tới khi xác nhận thành công.

LocalStorage dùng khóa `lunchgo:v1:auth`, chỉ lưu `{ version: 1, tokens: { accessToken, refreshToken } }`; không lưu mật khẩu hoặc hồ sơ. Token mới sau refresh được lưu lại. Dữ liệu lỗi/sai phiên bản được loại bỏ; LocalStorage bị chặn hoặc đầy không làm gián đoạn phiên trong bộ nhớ. `logout()` xóa tài khoản, token, lỗi và phiên đã lưu; phản hồi đến muộn từ lần đăng nhập/khôi phục trước đó bị bỏ qua. Giỏ hàng vẫn được giữ như trước. Trong lúc khôi phục, module giao diện dùng `selectAuthLoading`/`selectIsRestoringSession` để chờ kết quả trước khi xử lý điều hướng theo tài khoản.

### L03 — Trang Login

Mở `/login` hoặc nút **Tài khoản** trên Header. Giao diện dựa trên các trạng thái Login trong bản PDF thiết kế ngày 25/11/2026, dùng màu và thành phần chung của LunchGo. Form có tên đăng nhập, mật khẩu, nút ẩn/hiện, validation bắt buộc, lỗi API và trạng thái đang đăng nhập. Nút **Dùng tài khoản demo** điền `emilys` / `emilyspass`; lỗi được kiểm tra qua DummyJSON thật. Không có chức năng đăng ký.

`src/pages/LoginPage.tsx` dùng `useLoginForm` để dispatch `login` vào Redux Auth. Khi đang đăng nhập/khôi phục phiên, form bị khóa để tránh gửi lặp; rời Login sẽ hủy yêu cầu đăng nhập đang chờ. Validation đưa focus tới trường sai đầu tiên, lỗi API được đọc qua `role="alert"`, các trường dùng autocomplete phù hợp.

Đăng nhập thành công điều hướng bằng `replace`: mặc định về Home; nếu có `returnTo` hợp lệ thì quay lại đường dẫn nội bộ đó, giữ cả query và hash. Header tự tạo `returnTo` từ trang đang xem, giữ ngữ cảnh bộ lọc Menu. URL ngoài ứng dụng hoặc quay lại `/login` được thay bằng Home. F5 ở Login giữ đích đến trong URL nhưng không lưu mật khẩu. Tài khoản đã đăng nhập truy cập Login sẽ đi thẳng tới đích đến; Header hiển thị thông tin tài khoản và nút đăng xuất.

Login dùng AuthService độc lập với API món ăn. Các route cần catalog vẫn dùng chung `catalogLoader`; route Login không chờ tải sản phẩm/danh mục. File kiểm thử trình duyệt chỉ lưu bên ngoài repository.

### L04 — My Account

Mở **Tài khoản → Hồ sơ** sau khi đăng nhập hoặc truy cập `/account`. Trang dựa trên bố cục My Account trong PDF đã thống nhất: sidebar tài khoản, avatar/họ tên và bảng thông tin liên hệ. `UserProfile.address` giữ các trường địa chỉ công khai từ DummyJSON; `fetchUserProfile()` tải `/auth/me` nếu lần đăng nhập mới chỉ trả hồ sơ cơ bản. Avatar lỗi dùng chữ cái đầu của họ tên. Khi tải hồ sơ có lỗi tạm thời, trang cho phép thử lại; token hết hạn được làm mới một lần và phiên không hợp lệ được đưa về Login.

Người dùng có thể sửa số điện thoại và địa chỉ mặc định trong **Thông tin bổ sung**. Lưu thành công cập nhật ngay thông tin hiển thị. Dữ liệu dùng khóa `lunchgo:v1:profile:<userId>`, cấu trúc `{ version: 1, userId, phone, address }`, tách riêng từng tài khoản và vẫn còn sau đăng xuất/F5. Thông tin lưu bổ sung được ưu tiên so với dữ liệu API; chuỗi trống là lựa chọn xóa nội dung liên hệ. Hồ sơ không ghi mật khẩu/token vào khóa này và không sửa dữ liệu DummyJSON. Dữ liệu lưu lỗi hoặc không đúng userId/phiên bản được bỏ qua để dùng dữ liệu API. Nếu trình duyệt chặn lưu hoặc hết dung lượng, trang hiển thị lỗi và giữ thông tin đã lưu trước đó.

Hàm dùng chung tại `src/features/account/accountProfile.ts`: `getAccountContact(user)`, `loadProfileExtras(userId)`, `saveProfileExtras(userId, values)`, `formatUserAddress(address)` và `validateProfileExtras(values)`. Điện thoại chấp nhận định dạng quốc tế, 7–15 chữ số; địa chỉ tối đa 500 ký tự. Hai trường là tùy chọn. Các module sau có thể dùng `getAccountContact` để lấy dữ liệu API kết hợp thông tin bổ sung theo tài khoản.

Sidebar và menu tài khoản trên Header liên kết Hồ sơ, Đơn hàng, Yêu thích và Đăng xuất. Các route tài khoản đều chờ khôi phục phiên trước khi quyết định chuyển sang Login, giữ đường dẫn đích và query/hash. Theo phạm vi L04 đã chọn, `/account/orders` và `/account/favorites` chỉ hiển thị trang cùng trạng thái trống và nút mở thực đơn; lịch sử đơn hàng và lưu yêu thích sẽ được nối ở bước sau. Không thêm đơn hàng hoặc món yêu thích mẫu.

## Store và giao diện

- Store: `src/app/store.ts`; `Provider` bọc ứng dụng tại `src/main.tsx`.
- Dùng `useAppDispatch` và `useAppSelector` từ `src/app/hooks.ts`; `RootState`/`AppDispatch` được suy ra từ store.
- Cart slice lưu `productId` và `quantity`. Store khôi phục giỏ từ LocalStorage khi mở app và lưu khi giỏ thay đổi. Dữ liệu lỗi hoặc sai phiên bản được khởi tạo lại. Giỏ và checkout dùng chung cách tính tiền từ catalog Redux.
- SCSS entry: `src/styles/main.scss`, nạp Bootstrap và reset. Chỉnh biến màu tại `src/styles/_variables.scss`; Bootstrap và CSS variables `--lunchgo-*` dùng cùng bộ màu.

## Điều hướng 

| Đường dẫn | Trang |
| --- | --- |
| `/` | Trang chủ |
| `/menu` | Thực đơn |
| `/product/:id` | Chi tiết món; nhận `id` từ URL |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/login` | Đăng nhập bằng tài khoản demo DummyJSON |
| `/account` | Hồ sơ và thông tin liên hệ theo tài khoản |
| `/account/orders` | Trang Đơn hàng, hiện có trạng thái trống |
| `/account/favorites` | Trang Yêu thích, hiện có trạng thái trống |
| `*` | Trang 404 cho đường dẫn không tồn tại |

React Router giữ bộ lọc thực đơn khi tải lại và dùng Back/Forward. Nút quay về Thực đơn từ giỏ hoặc checkout giữ bộ lọc đang dùng.

Khi triển khai lên hosting, cần cấu hình SPA fallback về `index.html` để mở hoặc refresh URL con. Vite dev/preview hỗ trợ việc này khi chạy tại máy.

## Tuần 2

- **Dữ liệu.** Router loader nạp 20 món demo vào Redux. `CartItem` lưu `productId` khớp `LunchProduct.id` và `quantity`. Các action giỏ gồm `addToCart`, `increaseQuantity`, `decreaseQuantity`, `removeFromCart` và `clearCart`. `selectCartSummary` tính tổng từ giá và số lượng cho cả giỏ lẫn checkout. Giỏ giữ định dạng LocalStorage phiên bản 1.
- **Checkout.** `OrderDraft` dùng họ tên, điện thoại, địa chỉ, ghi chú tùy chọn và COD mô phỏng. Giỏ trống, món không khả dụng hoặc thông tin sai sẽ chặn xác nhận. Khi thành công, trang hiển thị `ConfirmedOrder` và xóa giỏ một lần.
- **Tích hợp và kiểm thử.** Bản nghiệm thu dựa trên `main` tại `e42a96b`, gồm catalog [PR #6](https://github.com/Thang-23130300/LunchGo/pull/6), giỏ [PR #7](https://github.com/Thang-23130300/LunchGo/pull/7) và checkout [PR #9](https://github.com/Thang-23130300/LunchGo/pull/9). Lint, build và 8/8 test đạt. Đã kiểm tra thêm/sửa/xóa giỏ, khôi phục giỏ qua F5 và tab mới, tổng tiền, kiểm tra form, bấm đúp xác nhận và Back/Forward. [Ảnh giỏ được khôi phục](docs/evidence/week2-cart-restored.jpg) · [Ảnh xác nhận đơn](docs/evidence/week2-order-confirmed.jpg)
- **Còn mở.** Nối API qua `CatalogSource` khi có endpoint và schema. Kiểm tra chia sẻ URL trên thiết bị thứ hai vẫn theo dõi ở tuần 1.

### Demo tuần 2

1. Mở `/menu`, tìm `phở`, thêm Phở bò hai lần và Phở gà một lần. Mở **Giỏ hàng** để xem số lượng và tổng `130.000đ`.
2. Bấm **Tiến hành thanh toán**. Dùng dữ liệu thử như tên `Khách Demo`, số `0901 234 567` và địa chỉ `Địa chỉ demo`. Xác nhận đơn bằng COD mô phỏng.
3. Kiểm tra mã đơn, tổng tiền và số món trong giỏ. Giỏ được xóa khi xác nhận thành công. F5 ở trang kết quả sẽ về màn hình giỏ trống vì kết quả chỉ giữ trong phiên hiện tại.

## Cấu trúc source 

- `src/app`: cấu hình ứng dụng; `src/features`: các module nghiệp vụ.
- `src/components`: component dùng chung; `src/pages`: các trang.
- `src/models`: kiểu dữ liệu; `src/services`: kết nối và xử lý dữ liệu.
- `src/styles`: style dùng chung; `src/utils`: hàm tiện ích; `src/data`: dữ liệu demo/fallback.

Alias `@/` trỏ tới `src/`, ví dụ `import App from '@/App.tsx'`; đã cấu hình đồng bộ trong TypeScript và Vite.

## Quy ước Git và PR 

- `main` là nhánh ổn định; thay đổi qua PR, không push trực tiếp lên `main`.
- Tên nhánh: `feat/<task>-<ten>`, `fix/<task>-<ten>` hoặc `docs/<task>-<ten>`, ví dụ `feat/l04-folder-structure`.
- Mỗi PR chỉ làm một task; không tự sửa code của thành viên khác ngoài phạm vi đã thống nhất.
- PR ghi Task ID, thay đổi chính, kết quả kiểm thử và ảnh giao diện nếu có. Khi đổi code, chạy `npm run lint` và `npm run build`; mục không áp dụng cần ghi lý do.
- Không commit `node_modules/`, `dist/`, `.env` thật, token hoặc secret. Giữ `package-lock.json`.

## Quy ước commit 

Dùng Conventional Commit:

feat(auth): add email verification flow
fix(cart): correct quantity validation
refactor(product): migrate product DAO to repository
docs(readme): update installation guide
test(order): add checkout service tests
chore(deps): update maven dependencies
