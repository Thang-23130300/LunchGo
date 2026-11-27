
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Order } from '@/models/order'
import type {
  ReviewDraft,
  ReviewRating,
} from '@/models/review'

interface ReviewDialogProps {
  productId: string
  productName: string
  orders: Order[]
  onClose: () => void
  onSubmit: (draft: ReviewDraft) => string | null
}

function ReviewDialog({
  productId,
  productName,
  orders,
  onClose,
  onSubmit,
}: ReviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [rating, setRating] =
    useState<ReviewRating | 0>(0)

  const [comment, setComment] = useState('')
  const [orderId, setOrderId] = useState(
    orders[0]?.orderId ?? ''
  )

  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current

    if (dialog && !dialog.open) {
      dialog.showModal()
    }

    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.')
      return
    }

    if (!orderId) {
      setError('Vui lòng chọn đơn hàng.')
      return
    }

    const result = onSubmit({
      productId,
      orderId,
      rating,
      comment,
    })

    if (result) {
      setError(result)
      return
    }

    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="review-dialog"
      aria-labelledby="review-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="review-dialog__header">
        <h2 id="review-dialog-title">
          Đánh giá món ăn
        </h2>

        <button
          type="button"
          className="review-dialog__close"
          aria-label="Đóng"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <p className="review-dialog__product">
        {productName}
      </p>

      <form onSubmit={handleSubmit}>
        <label className="review-dialog__label">
          Đơn hàng

          <select
            value={orderId}
            onChange={(event) => {
              setOrderId(event.target.value)
              setError('')
            }}
            required
          >
            {orders.map((order) => (
              <option
                key={order.orderId}
                value={order.orderId}
              >
                {order.orderId}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="review-dialog__rating">
          <legend>
            Bạn đánh giá món ăn này thế nào?
          </legend>

          <div className="review-dialog__stars">
            {([1, 2, 3, 4, 5] as const).map((star) => (
              <button
                key={star}
                type="button"
                className={
                  star <= rating ? 'is-active' : ''
                }
                aria-label={`${star} sao`}
                aria-pressed={rating === star}
                onClick={() => {
                  setRating(star)
                  setError('')
                }}
              >
                ★
              </button>
            ))}
          </div>

          <p>
            {rating > 0
              ? `${rating}/5 sao`
              : 'Chọn số sao'}
          </p>
        </fieldset>

        <label className="review-dialog__label">
          Nhận xét (không bắt buộc)

          <textarea
            rows={4}
            maxLength={500}
            value={comment}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            onChange={(event) =>
              setComment(event.target.value)
            }
          />
        </label>

        <p className="review-dialog__counter">
          {comment.length}/500 ký tự
        </p>

        {error && (
          <p
            role="alert"
            className="review-dialog__error"
          >
            {error}
          </p>
        )}

        <div className="review-dialog__actions">
          <button
            type="button"
            className="site-button"
            onClick={onClose}
          >
            Hủy
          </button>

          <button
            type="submit"
            className="site-button site-button--primary"
          >
            Gửi đánh giá
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default ReviewDialog
