import { getCustomizationProductId } from '@/data/customizationProductMap'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/app/hooks'
import type { AppDispatch } from '@/app/store'
import { addToCart } from '@/features/cart/cartSlice'
import { optionGroups } from '@/data/optionGroups'
import { options } from '@/data/options'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { Link, useLocation, useOutletContext, useParams, useRevalidator } from 'react-router'
import { usePageTitle } from '@/app/usePageTitle'
import Breadcrumb from '@/components/Breadcrumb'
import DishImage from '@/components/DishImage'
import '../styles/product-detail.scss'
import { useFavorites } from '@/features/favorites/useFavorites'
import ProductReviews from '@/components/ProductReviews'
import { useSoldCount } from '@/features/products/useSoldCount'

const CATEGORY_LABELS: Record<string, string> = {
  COM: 'Cơm',
  BUN: 'Bún',
  PHOHUTIEU: 'Phở / Hủ tiếu',
  MI: 'Mì',
  BANHMI: 'Bánh mì',
  CUON: 'Cuốn',
  BANH: 'Bánh',
  CHAO: 'Cháo',
  SALAD: 'Salad',
  DOUONG: 'Đồ uống',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

type ShareButtonProps = {
  productName: string
}

function ShareButton({ productName }: ShareButtonProps) {
  const [result, setResult] = useState<'copied' | 'failed'>()

  async function handleCopy() {
    const url = new URL(window.location.href)
    url.hash = ''
    try {
      await navigator.clipboard.writeText(url.href)
      setResult('copied')
    } catch {
      setResult('failed')
    }
  }

  return (
    <div className="product-detail__share-control">
      <button
        type="button"
        className="site-button product-detail__share"
        onClick={handleCopy}
        aria-label={`Sao chép liên kết món ${productName}`}
      >
        Sao chép liên kết
      </button>
      <p className="action-status" role="status">
        {result === 'copied' && 'Đã sao chép liên kết.'}
        {result === 'failed' && 'Không thể sao chép. Bạn có thể dùng địa chỉ trên thanh trình duyệt.'}
      </p>
    </div>
  )
}

function ProductPage() {
  const { id } = useParams<{ id: string }>()
  return <ProductDetails key={id} id={id} />
}

function ProductDetails({ id }: { id: string | undefined }) {
  const dispatch = useDispatch<AppDispatch>()
  const { isFavorite, toggleFavorite, authLoading } = useFavorites()
  const [quantity, setQuantity] = useState(1)
  const [addedProduct, setAddedProduct] = useState<{ id: string; count: number }>()
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
  const [optionError, setOptionError] = useState('')
  const { pathname, search } = useLocation()
  const menuHref = useOutletContext<string>()
 const { products, status, categories } = useAppSelector(selectCatalog)
  const { state: revalidationState, revalidate } = useRevalidator()

  const product = products.find((item) => item.id === id)
  const soldCount = useSoldCount(
  id ?? '',
  product?.baseSoldCount ?? 0
)
  const rawCategory =
  categories.find((category) => category.id === product?.categoryId)?.name
  ?? product?.category
  ?? ''

const categoryName =
  CATEGORY_LABELS[rawCategory.toUpperCase()] ?? rawCategory
  usePageTitle(product?.name ?? 'Chi tiết món')
  const cartQuantity = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => item.productId === id ? sum + item.quantity : sum, 0)
  )
  const productGroups = optionGroups
    .filter(
      (group) =>
        group.productId === getCustomizationProductId(product?.id ?? '')
    )
    .map((group) => ({
      ...group,
      choices: options.filter(
        (option) => option.groupId === group.id && option.isActive
      ),
    }))
    .filter((group) => group.choices.length > 0)

  const selectedOptions = productGroups.flatMap((group) => group.choices).filter(
    (option) => selectedOptionIds.includes(option.id)
  )

  const additionalPrice = selectedOptions.reduce(
    (sum, option) => sum + option.additionalPrice,
    0
  )

  const unitPrice = (product?.price ?? 0) + additionalPrice
  const totalPrice = unitPrice * quantity

  function handleOptionChange(
    groupId: string,
    optionId: string,
    selectionType: 'SINGLE' | 'MULTIPLE'
  ) {
    const group = productGroups.find((item) => item.id === groupId)

    if (!group) return

    const groupOptionIds = group.choices.map((item) => item.id)

    const groupSelection = selectedOptionIds.filter((id) => groupOptionIds.includes(id))
    if (selectionType === 'MULTIPLE' && !groupSelection.includes(optionId) &&
      groupSelection.length >= group.maxSelection) {
      setOptionError(
        `Nhóm "${group.name}" chỉ được chọn tối đa ${group.maxSelection}`
      )
      return
    }

    setSelectedOptionIds((current) => {
      if (selectionType === 'SINGLE') {
        return [...current.filter((id) => !groupOptionIds.includes(id)), optionId]
      }
      return current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    })
    setOptionError('')
  }

  function handleAddToCart() {
    if (!product || !product.isAvailable) return

    for (const group of productGroups) {
      const selectedCount = group.choices.filter(
        (option) => selectedOptionIds.includes(option.id)
      ).length

      const minimum = Math.max(
        group.minSelection,
        group.isRequired ? 1 : 0
      )

      if (selectedCount < minimum) {
        setOptionError(
          `Nhóm "${group.name}" cần chọn ít nhất ${minimum} lựa chọn`
        )
        return
      }

      if (selectedCount > group.maxSelection) {
        setOptionError(
          `Nhóm "${group.name}" chỉ được chọn tối đa ${group.maxSelection}`
        )
        return
      }
    }

    dispatch(
      addToCart({
        productId: product.id,
        quantity,
        selectedOptionIds,
      })
    )
    setAddedProduct({ id: product.id, count: cartQuantity + quantity })
    setQuantity(1)
    setSelectedOptionIds([])
    setOptionError('')
  }

  if (status === 'idle') {
    return (
      <section className="product-detail">
        <div className="product-detail__container">
          <p className="product-detail__message" role="status">
            Đang tải thông tin món ăn...
          </p>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__error" role="alert">
            {status === 'error'
              ? 'Không thể tải thông tin món ăn.'
              : 'Không tìm thấy món ăn này.'}
          </div>

          <div className="product-detail__error-actions">
            {status === 'error' && (
              <button
                type="button"
                className="site-button site-button--primary"
                disabled={revalidationState === 'loading'}
                onClick={() => void revalidate()}
              >
                {revalidationState === 'loading' ? 'Đang tải lại...' : 'Thử lại'}
              </button>
            )}

            <Link
              to={menuHref}
              className="site-button"
            >
              ← Quay lại thực đơn
            </Link>
          </div>

          {revalidationState === 'loading' && <p role="status">Đang tải lại thông tin món ăn...</p>}
        </div>
      </section>
    )
  }

  return (
    <section className="product-detail">
      <div className="product-detail__container">
        <Breadcrumb items={[{ label: 'Thực đơn', to: menuHref }, { label: product.name }]} />
        <div className="product-detail__actions">
          <Link className="product-detail__back" to={menuHref}>← Quay lại thực đơn</Link>

          <ShareButton key={pathname + search} productName={product.name} />

          <button
            type="button"
            className={`product-detail__favorite ${isFavorite(product.id)
                ? 'product-detail__favorite--active'
                : ''
              }`}
            disabled={authLoading}
            aria-pressed={isFavorite(product.id)}
            onClick={() => toggleFavorite(product.id)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorite(product.id) ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>

            {isFavorite(product.id)
              ? 'Đã yêu thích'
              : 'Yêu thích'}
          </button>

        </div>

        <div className="product-detail__content">
          <div className="product-detail__image-wrapper">
            <DishImage
              src={product.image}
              name={product.name}
              className="product-detail__image"
            />
          </div>

          <div className="product-detail__information">
          <span className="product-detail__category">
  {categoryName}
</span>

            <h1 className="product-detail__name">
              {product.name}
            </h1>
            <div className="product-detail__sold-count">
  Đã bán <strong>{soldCount}</strong> phần
</div>
            {product.description && (
  <p className="product-detail__description">
    {product.description}
  </p>
)}

            <p className="product-detail__price">
              {formatPrice(product.price)}
            </p>

            <div className="product-detail__divider" />
            <p
              className={
                product.isAvailable
                  ? 'product-detail__availability product-detail__availability--available'
                  : 'product-detail__availability product-detail__availability--unavailable'
              }
            >
              <span className="product-detail__availability-dot" />
              {product.isAvailable ? 'Đang có sẵn' : 'Tạm hết món'}
            </p>
            <p className="product-detail__source">Nguồn dữ liệu: {product.source}</p>

            {product.calories !== undefined && (
              <p className="product-detail__calories">
                Năng lượng: {product.calories} kcal / khẩu phần
              </p>
            )}

            <div className="product-detail__divider" />

            <div className="product-detail__ingredients">
              <h2>NGUYÊN LIỆU</h2>

              {product.ingredients.length > 0 ? (
                <ul>
                  {product.ingredients.map((ingredient, index) => (
                    <li key={`${ingredient}-${index}`}>{ingredient}</li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có thông tin nguyên liệu.</p>
              )}
            </div>
            {productGroups.length > 0 && (
              <div className="product-detail__customization">
                <h2>TÙY CHỌN MÓN ĂN</h2>

                {productGroups.map((group) => (
                  <div key={group.id} className="product-detail__option-group">

<div className="product-detail__option-heading">
  <h3>{group.name}</h3>

  <span
    className={`product-detail__option-badge${
      group.isRequired ? ' is-required' : ''
    }`}
  >
    {group.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
  </span>
</div>

<p>
  {group.selectionType === 'SINGLE'
    ? group.isRequired || group.minSelection > 0
      ? 'Chọn 1 lựa chọn'
      : 'Chọn tối đa 1 lựa chọn'
    : `Chọn từ ${Math.max(
        group.minSelection,
        group.isRequired ? 1 : 0
      )} đến ${group.maxSelection} lựa chọn`}
</p>


                    {group.choices.map((option) => (
                      <label
                        key={option.id}
                        className="product-detail__option"
                      >
                        <input
                          type={
                            group.selectionType === 'SINGLE'
                              ? 'radio'
                              : 'checkbox'
                          }
                          name={group.id}
                          checked={selectedOptionIds.includes(option.id)}
                          disabled={!product.isAvailable}
                          onChange={() =>
                            handleOptionChange(
                              group.id,
                              option.id,
                              group.selectionType
                            )
                          }
                        />

                        <span>{option.name}</span>

                        <span>
                          {option.additionalPrice > 0
                            ? `+${formatPrice(option.additionalPrice)}`
                            : 'Miễn phí'}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}

                {optionError && (
                  <p role="alert" className="product-detail__option-error">
                    {optionError}
                  </p>
                )}
              </div>
            )}


<div className="product-detail__total">
  <div className="product-detail__total-row">
    <span>Giá món ăn</span>
    <span>{formatPrice(product.price)}</span>
  </div>

  <div className="product-detail__total-row">
    <span>Phụ phí tùy chọn</span>
    <span>{formatPrice(additionalPrice)}</span>
  </div>

  <div className="product-detail__total-row">
    <span>Số lượng</span>
    <span>× {quantity}</span>
  </div>

  <div className="product-detail__total-final">
    <strong>Tổng tiền</strong>
    <strong>{formatPrice(totalPrice)}</strong>
  </div>
</div>

            <div className="product-detail__quantity">
              <span className="product-detail__quantity-label">
                Số lượng
              </span>

              <div className="product-detail__quantity-controls">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1 || !product.isAvailable}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                >
                  −
                </button>

                <span aria-live="polite">{quantity}</span>

                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  disabled={!product.isAvailable}
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="site-button site-button--primary product-detail__add-button"
              disabled={!product.isAvailable}
              onClick={handleAddToCart}
            >
              {!product.isAvailable
  ? 'Tạm hết món'
  : quantity > 1
    ? `+ Thêm ${quantity} phần vào giỏ hàng`
    : '+ Thêm vào giỏ hàng'}
            </button>

            <p className="action-status" role="status">
              {addedProduct?.id === product.id && `Đã thêm ${product.name} · ${addedProduct.count} phần trong giỏ.`}
            </p>
          </div>
        </div>

      </div>
      <ProductReviews product={product} />
    </section>
  )
}

export default ProductPage
