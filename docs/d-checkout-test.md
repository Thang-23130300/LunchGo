# W2-D06 — Kết quả kiểm thử luồng Checkout

**Người thực hiện:** D  
**Nhánh:** `feature/w2-checkout`  
**File kiểm thử:** `src/pages/CheckoutPage.tsx`, `src/features/checkout/orderTypes.ts`

---

## TC08 — Vào /checkout khi giỏ trống

**Kịch bản:** Mở `/checkout` khi `cartItems.length === 0`

**Logic trong code:**
```ts
if (!catalogLoading && isEmpty) {
  return <section>Giỏ hàng trống ... <Link to="/menu">Xem thực đơn</Link></section>
}
```
Nút "Xác nhận đơn" trong `OrderSummary` cũng có `disabled={submitting || isEmpty}` — không thể bấm.

**Kết quả:** ✅ PASS  
Hiển thị màn hình "Giỏ hàng trống", có link quay lại thực đơn, không thể xác nhận đơn.

---

## TC09 — Bỏ trống tên / điện thoại / địa chỉ

**Kịch bản:** Có món trong giỏ, bấm "Xác nhận đơn" mà không điền gì.

**Logic trong code:**
```ts
const allTouched = { name: true, phone: true, address: true }
setTouched(allTouched)
const formErrors = validateForm(info)
if (Object.keys(formErrors).length > 0) {
  setErrors(formErrors)
  submittingRef.current = false
  setSubmitting(false)
  return   // ← dừng, không tạo đơn
}
```
`validateForm` trả lỗi cho từng trường trống riêng biệt.

**Kết quả:** ✅ PASS  
Ba trường hiện thông báo lỗi ngay tại trường (`invalid-feedback`), không tạo `OrderDraft`.

---

## TC10 — Điện thoại sai định dạng

**Kịch bản:** Nhập tên + địa chỉ hợp lệ, điện thoại = `"abc"` hoặc `"123"` (< 9 chữ số).

**Logic trong code:**
```ts
function isValidPhone(value: string): boolean {
  return /^[\d\s\-+]{9,15}$/.test(value.trim())
    && value.replace(/\D/g, '').length >= 9
}
```
- `"abc"` → regex thất bại → lỗi
- `"123"` → chỉ có 3 chữ số → `length >= 9` thất bại → lỗi
- `"0901 234 567"` → 10 chữ số → PASS

**Kết quả:** ✅ PASS  
Hiển thị `"Số điện thoại không hợp lệ (cần ít nhất 9 chữ số)."` đúng trường, chặn submit.

---

## TC11 — Tổng đơn checkout khớp với /cart

**Kịch bản:** Thêm 2 món vào giỏ, vào `/checkout`, so sánh tổng.

**Logic trong code:**
```ts
// orderItems tính từ cùng cartItems (Redux) + cùng catalog
const orderItems = useMemo(() => {
  return cartItems.flatMap((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId)
    if (!product) return []
    return [{ lineTotal: product.price * cartItem.quantity, ... }]
  })
}, [cartItems, products])

const total = useMemo(
  () => orderItems.reduce((sum, item) => sum + item.lineTotal, 0),
  [orderItems],
)
```
Dùng **cùng Redux state** (`cartItems`) và **cùng catalog** (`getCatalog()`). Không lưu tổng riêng. Mọi thay đổi số lượng trong tóm tắt dispatch thẳng vào Redux → `orderItems` tính lại ngay lập tức.

**Kết quả:** ✅ PASS  
Tổng checkout luôn khớp với giỏ hàng sau mọi thay đổi.

---

## TC12 — Xác nhận đơn demo thành công (happy-path)

**Kịch bản:** Điền đủ tên/SĐT/địa chỉ hợp lệ, có ít nhất 1 món trong giỏ, bấm "Xác nhận đơn".

**Logic trong code:**
```ts
await new Promise<void>((resolve) => setTimeout(resolve, 600)) // mô phỏng async
const order: OrderDraft = { orderId: generateOrderId(), customer, items, total, paymentMethod: 'cod', ... }
dispatch(clearCart())     // ← xóa giỏ CHỈ ở đây, sau khi tạo đơn thành công
setConfirmedOrder(order)  // ← chuyển sang màn hình kết quả
```
Màn hình kết quả hiển thị: mã đơn, tên/SĐT/địa chỉ, danh sách món, tổng, ghi rõ "không thu tiền thật".

**Kết quả:** ✅ PASS  
Luồng hoàn chỉnh, giỏ chỉ bị xóa khi đơn được tạo, có kết quả rõ ràng.

---

## TC13 — Bấm xác nhận liên tiếp (double-submit) và F5 trang kết quả

### Double-submit
**Logic trong code:**
```ts
const submittingRef = useRef(false)

async function handleSubmit(e) {
  if (submittingRef.current) return  // ← chặn lần 2 trở đi
  submittingRef.current = true
  setSubmitting(true)
  // ... xử lý ...
  submittingRef.current = false
  setSubmitting(false)
}
```
`useRef` không gây re-render nên giữ được giá trị `true` trong suốt async. Nút cũng bị `disabled={submitting}` trong lúc xử lý.

**Kết quả:** ✅ PASS — Không sinh hai đơn dù bấm nhanh liên tiếp.

### F5 trên trang kết quả
`confirmedOrder` là **local React state** (`useState`), không lưu vào LocalStorage hay URL.  
F5 → component unmount → state reset về `null` → `isEmpty === true` (giỏ đã bị `clearCart`) → hiển thị màn hình "Giỏ hàng trống".

Hành vi này **có chủ ý**: không có đơn ảo nào tồn tại sau khi reload. Người dùng thấy thông báo rõ ràng thay vì màn hình kết quả lặp lại.

**Kết quả:** ✅ PASS — F5 không tạo đơn ảo, hành vi rõ ràng và nhất quán.

---

## Tổng kết W2-D06

| Test case | Tình huống | Kết quả |
|---|---|---|
| TC08 | Vào /checkout khi giỏ trống | ✅ PASS |
| TC09 | Bỏ trống tên/SĐT/địa chỉ | ✅ PASS |
| TC10 | Điện thoại sai định dạng | ✅ PASS |
| TC11 | Tổng đơn khớp với /cart | ✅ PASS |
| TC12 | Happy-path xác nhận đơn demo | ✅ PASS |
| TC13a | Bấm xác nhận liên tiếp | ✅ PASS |
| TC13b | F5 trang kết quả | ✅ PASS |

**Kết luận:** Tất cả 7 ca kiểm thử đạt. Không có ca nào báo thành công khi thiếu dữ liệu. Không có đơn ảo khi quay lại hoặc F5.

---

## Ghi chú kỹ thuật cho Leader tích hợp

| Điểm | Chi tiết |
|---|---|
| D chỉ đọc Redux cart | Dispatch `increaseQuantity`, `decreaseQuantity`, `removeFromCart`, `clearCart` từ `cartSlice` của B — không tạo slice mới |
| Không lưu OrderDraft | Đơn chỉ tồn tại trong local state, mất khi F5 — đúng scope demo |
| Tổng tiền | Tính tại render, không lưu riêng vào store |
| File D sở hữu | `src/pages/CheckoutPage.tsx`, `src/features/checkout/orderTypes.ts` |
| File D không chạm | `cartSlice.ts`, `routes.tsx`, `store.ts`, `model/product.ts` |
