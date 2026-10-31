
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { LunchProduct } from '@/models/product'
import { fallbackCatalog } from '@/data/fallbackCatalog'
import { getMealById } from '@/services/theMealDbClient'
import { getRecipeById } from '@/services/dummyJsonClient'
import { mapMealDbMeal, mapDummyRecipe } from '@/services/productMapper'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<LunchProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProduct() {
      setLoading(true)
      setProduct(null)
      setApiError(false)

      if (!id) {
        setLoading(false)
        return
      }

      const separatorIndex = id.indexOf(':')
      const source = separatorIndex >= 0 ? id.slice(0, separatorIndex) : ''
      const sourceId = separatorIndex >= 0 ? id.slice(separatorIndex + 1) : ''

      try {
        let result: LunchProduct | null = null

        if (source === 'local') {
          result = fallbackCatalog.find((item) => item.id === id) ?? null
        } else if (source === 'themealdb') {
          const meal = await getMealById(sourceId)
          result = meal ? mapMealDbMeal(meal) : null
        } else if (source === 'dummyjson') {
          if (!/^\d+$/.test(sourceId)) {
            throw new Error('Invalid recipe ID')
          }

          const recipe = await getRecipeById(Number(sourceId))
          result = mapDummyRecipe(recipe)
        }

        if (active) {
          setProduct(result)
        }
      } catch {
        if (active) {
          setApiError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <section className="container py-5">
        <p role="status" className="text-secondary">
          Đang tải thông tin món ăn...
        </p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="container py-5">
        <div className="alert alert-warning">
          {apiError
            ? 'Không thể tải thông tin món ăn. Vui lòng thử lại sau.'
            : 'Không tìm thấy món ăn này.'}
        </div>
        <Link className="btn btn-outline-primary" to="/menu">
          Quay lại thực đơn
        </Link>
      </section>
    )
  }

  return (
    <section className="container py-4">
      <Link to="/menu" className="text-decoration-none">
        ← Quay lại thực đơn
      </Link>

      <div className="row g-4 mt-2">
        <div className="col-12 col-md-6">
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: 420, objectFit: 'cover' }}
          />
        </div>

        <div className="col-12 col-md-6">
          <span className="badge text-bg-light mb-2">
            {product.category}
          </span>

          <h1 className="fw-bold">{product.name}</h1>

          <p className="fs-4 fw-bold text-danger">
            {formatPrice(product.price)}
          </p>

          <p className="text-secondary">
            Nguồn dữ liệu: {product.source}
          </p>

          {product.calories !== undefined && (
            <p>
              Năng lượng: {product.calories} kcal / khẩu phần
            </p>
          )}

          <h2 className="h5 mt-4">Nguyên liệu</h2>

          {product.ingredients.length > 0 ? (
            <ul>
              {product.ingredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary">
              Chưa có thông tin nguyên liệu.
            </p>
          )}

          <p className={product.isAvailable ? 'text-success' : 'text-danger'}>
            {product.isAvailable ? 'Đang có sẵn' : 'Tạm hết món'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProductPage
