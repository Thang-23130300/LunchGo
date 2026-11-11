# D08 — Kết quả kiểm thử module D

**Người thực hiện:** D  
**Ngày bàn giao:** 09/11/2026  
**Nhánh:** `feat/d01-d06-menu-product-ui`  
**Build cuối:** `npm run build` — PASS (không có lỗi TypeScript, bundle xuất ra `dist/`)

---

## Files thay đổi

| File | Vai trò |
|---|---|
| `src/pages/MenuPage.tsx` | MenuPage: search, filter, sort, pagination, URL sync, retry |
| `src/pages/ProductPage.tsx` | ProductPage: chi tiết món, copy link, back, retry |
| `src/services/catalogService.ts` | getCatalog / getCatalogProduct (D không tạo, chỉ dùng) |
| `docs/d-handover.md` | Biên bản nhận bàn giao từ B |
| `docs/d-test-results.md` | File này |

> D **không** tạo thêm API client, mapper hay model mới.  
> D **không** sửa Router, Store, `models/product.ts`, `dummyJsonClient.ts`, `theMealDbClient.ts`, `productMapper.ts`.

---

## Exports / Interface Leader cần biết

```ts
// src/pages/MenuPage.tsx
export default MenuPage        // Route: /menu  (query: q, category, sort, page, pageSize)

// src/pages/ProductPage.tsx
export default ProductPage     // Route: /product/:id
```

Route đã được đăng ký trong `src/app/routes.tsx` bởi Leader (L09).  
MenuPage import `MenuPage` và `ProductPage` từ `@/features/discovery` — alias này cần Leader giữ nguyên.

---

## Kết quả kiểm thử từng ca (PASS / FAIL)

### D01 — Nhận bàn giao

| Ca | Mô tả | Kết quả |
|---|---|---|
| D01-AC01 | Gọi `getCatalog()` trả về 20 món từ `fallbackCatalog` | **PASS** |
| D01-AC02 | Không có service/mapper/client trùng lặp với B | **PASS** |

### D02 — MenuPage + SearchBar

| Ca | Mô tả | Kết quả |
|---|---|---|
| D02-AC01 | Gõ "phở" → chỉ hiện món có "phở" trong tên hoặc nguyên liệu | **PASS** |
| D02-AC01b | Gõ "thịt bò" → khớp theo nguyên liệu | **PASS** |
| D02-AC02a | Khi đang tải: hiện "Đang tải thực đơn..." | **PASS** |
| D02-AC02b | Khi không có kết quả: hiện "Không tìm thấy món ăn phù hợp." | **PASS** |
| D02-AC02c | Khi API lỗi: hiện cảnh báo + nút "Thử lại" | **PASS** |

### D03 — Filter / Sort / Phân trang

| Ca | Mô tả | Kết quả |
|---|---|---|
| D03-AC01a | Chọn danh mục "Cơm" → chỉ hiện 4 món cơm | **PASS** |
| D03-AC01b | Sort "Giá tăng dần" → Trứng chiên (20k) lên đầu | **PASS** |
| D03-AC01c | Sort "Giá giảm dần" → các món 45k lên đầu | **PASS** |
| D03-AC01d | Đổi pageSize sang 24, trang 1 hiện đủ 20 món (tổng < 24) | **PASS** |
| D03-AC02 | Sort không dùng `.sort()` trực tiếp trên state gốc (dùng spread `[...list]`) | **PASS** |

### D04 — Đồng bộ URL

| Ca | Mô tả | Kết quả |
|---|---|---|
| D04-AC01 | Copy URL `/menu?q=ph%E1%BB%9F&category=M%C3%B3n+n%C6%B0%E1%BB%9Bc&sort=price_asc&page=1` → mở tab mới → hiện đúng trạng thái | **PASS** |
| D04-AC02a | Nhấn Back sau khi lọc → URL về trạng thái trước | **PASS** |
| D04-AC02b | Nhấn Forward → khôi phục lại filter đã đổi | **PASS** |
| D04-AC02c | URL không có key dư thừa khi dùng giá trị mặc định (sort=default không xuất hiện trong URL) | **PASS** |

### D05 — Deep link sản phẩm

| Ca | Mô tả | Kết quả |
|---|---|---|
| D05-AC01a | Mở `/product/local%3A550e8400-e29b-41d4-a716-446655440001` trực tiếp → hiện "Phở bò" | **PASS** |
| D05-AC01b | Nhấn "🔗 Sao chép liên kết" → clipboard có đường dẫn canonical | **PASS** |
| D05-AC01c | Tải lại trang ProductPage → vẫn hiện đúng sản phẩm (load từ ID, không từ state) | **PASS** |
| D05-AC02 | Mở `/product/khong-ton-tai` → hiện "Không tìm thấy món ăn này." | **PASS** |

### D06 — History / Location

| Ca | Mô tả | Kết quả |
|---|---|---|
| D06-AC01a | Từ MenuPage → chi tiết → Back → quay về đúng trang menu với filter cũ | **PASS** |
| D06-AC01b | Forward từ menu → chi tiết → hiện đúng sản phẩm | **PASS** |
| D06-AC02 | `useLocation` trả đúng `pathname=/product/...` và `search` trên ProductPage | **PASS** |
| D06-AC02b | Nút "Quay lại thực đơn" trên ProductPage fallback về `/menu` nếu không có `fromMenu` trong state | **PASS** |

### D07 — Fallback & lỗi đường dẫn

| Ca | Mô tả | Kết quả |
|---|---|---|
| D07-AC01a | URL `/menu?q=` (query rỗng) → hiện toàn bộ thực đơn, không crash | **PASS** |
| D07-AC01b | URL `/menu?q=ph%E1%BB%9F` (Unicode NFC) → khớp đúng "Phở bò" | **PASS** |
| D07-AC01c | URL `/menu?q=%22%3Cscript%3E%22` (ký tự đặc biệt) → không crash, hiện empty state | **PASS** |
| D07-AC01d | URL `/menu?sort=invalid_value` → fallback về sort mặc định | **PASS** |
| D07-AC01e | URL `/menu?page=-5` hoặc `?page=abc` → fallback về trang 1 | **PASS** |
| D07-AC01f | URL `/menu?category=DanhMucKhongTonTai` → fallback về "Tất cả" | **PASS** |
| D07-AC02a | MenuPage khi API lỗi: hiện cảnh báo + nút "Thử lại" tải lại catalog | **PASS** |
| D07-AC02b | ProductPage khi API lỗi: hiện cảnh báo + nút "Thử lại" | **PASS** |
| D07-AC02c | ProductPage khi ID không tồn tại: hiện "Không tìm thấy món ăn này." (không có nút retry vì không phải lỗi mạng) | **PASS** |

---

## Checklist bàn giao cho Leader

- [x] Build `npm run build` — PASS
- [x] Không còn lỗi TypeScript (`tsc --noEmit`)
- [x] Không tạo service/mapper/client trùng lặp
- [x] Không sửa Router / Store / model chung
- [x] URL roundtrip PASS (copy → tab mới → cùng kết quả)
- [x] Back/Forward browser PASS
- [x] Retry khi API lỗi có trên cả MenuPage và ProductPage
- [x] Deep link `/product/:id` reload được
- [x] 404 hữu ích khi ID không tồn tại
- [x] `docs/d-handover.md` đã có
- [x] `docs/d-test-results.md` — file này

## Ghi chú cho Leader tích hợp

1. **Import path**: `MenuPage` và `ProductPage` hiện được export từ `@/features/discovery`. Leader cần đảm bảo alias/barrel `src/features/discovery/index.ts` vẫn re-export cả hai.
2. **Route params**: ProductPage đọc `useParams<{ id: string }>()` — ID phải được encode đúng (`encodeURIComponent`) khi tạo link từ MenuPage (đã làm).
3. **Redux**: cả hai page dùng `useDispatch<AppDispatch>()` và action `addToCart(product.id)` từ `@/features/cart/cartSlice` — không thay đổi interface này.
4. **catalogService**: `getCatalog()` và `getCatalogProduct(id)` từ `@/services/catalogService` — D không sửa file này, chỉ gọi.
