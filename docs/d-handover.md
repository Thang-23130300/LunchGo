# D01 — Bàn giao từ B + Kiểm tra API

## Cấu trúc folder B

```
src/models/product.ts          — LunchProduct, ProductSource, Category, Nutrition
src/data/fallbackCatalog.ts    — 20 món local seed
src/services/dummyJsonClient.ts — API client dummyjson.com/recipes
src/services/theMealDbClient.ts — API client themealdb.com
src/services/productMapper.ts  — mapDummyRecipe + mapMealDbMeal → LunchProduct
```

## Model LunchProduct

| Field | Type | Ghi chú |
|---|---|---|
| id | string | namespaced: `local:uuid`, `dummyjson:1`, `themealdb:52772` |
| name | string | |
| image | string | |
| category | string | |
| price | number | VND demo, không suy ra giá thật |
| source | ProductSource | |
| ingredients | string[] | |
| calories | number? | |
| isAvailable | boolean | |

## API đã kiểm tra

| Hàm | Endpoint | Kết quả |
|---|---|---|
| `getRecipes(30)` | GET /recipes?limit=30 | ✅ 30 recipe có id, name, image, cuisine, ingredients |
| `getRecipeById(1)` | GET /recipes/1 | ✅ "Classic Margherita Pizza" |
| `getRecipeById(2)` | GET /recipes/2 | ✅ "Vegetable Stir Fry" |
| `searchRecipes('chicken')` | GET /recipes/search?q=chicken | ✅ Danh sách có "Chicken" |
| `getRecipeTags()` | GET /recipes/tags | ✅ Mảng string tag |

## 5 sản phẩm local seed kiểm tra

| ID | Tên | Category | Giá |
|---|---|---|---|
| local:...001 | Phở bò | Món nước | 45.000đ |
| local:...005 | Cơm tấm sườn | Cơm | 40.000đ |
| local:...009 | Bánh mì thịt | Bánh mì | 25.000đ |
| local:...015 | Gỏi cuốn | Món cuốn | 30.000đ |
| local:...020 | Salad rau củ | Món salad | 30.000đ |

## Ghi chú

- `DEFAULT_DEMO_PRICE = 35000` cho DummyJSON và TheMealDB, local seed có giá riêng từng món
- TheMealDB chỉ dùng ở ProductPage (load chi tiết), không dùng để list ở MenuPage
- D không tạo API client trùng, dùng lại toàn bộ của B
- D không sửa Router / Store / model chung

## Xác nhận đọc

- [x] architecture-week1.md
- [x] leader-test-results.md
