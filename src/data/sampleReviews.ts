
import type { ReviewRating } from '@/models/review'

export interface SampleReview {
  id: string
  productId: string
  userName: string
  rating: ReviewRating
  comment: string
  createdAt: string
}

export const sampleReviews: SampleReview[] = [
  {
    id: 'SAMPLE-001',
    productId: 'FOOD013',
    userName: 'Khách hàng mẫu 01',
    rating: 5,
    comment: 'Nước dùng đậm đà, thịt bò mềm và ngon.',
    createdAt: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'SAMPLE-002',
    productId: 'FOOD013',
    userName: 'Khách hàng mẫu 02',
    rating: 4,
    comment: 'Khẩu phần vừa đủ, món ăn ngon.',
    createdAt: '2026-11-02T08:00:00.000Z',
  },
  {
    id: 'SAMPLE-003',
    productId: 'FOOD014',
    userName: 'Khách hàng mẫu 03',
    rating: 5,
    comment: 'Bò viên ngon, nước dùng thơm.',
    createdAt: '2026-11-03T08:00:00.000Z',
  },
  {
    id: 'SAMPLE-004',
    productId: 'FOOD015',
    userName: 'Khách hàng mẫu 04',
    rating: 4,
    comment: 'Thịt gà mềm, nước dùng thanh nhẹ.',
    createdAt: '2026-11-04T08:00:00.000Z',
  },
  {
    id: 'SAMPLE-005',
    productId: 'FOOD016',
    userName: 'Khách hàng mẫu 05',
    rating: 5,
    comment: 'Hủ tiếu ngon, nhiều nguyên liệu.',
    createdAt: '2026-11-05T08:00:00.000Z',
  },
]

export function getSampleReviews(productId: string) {
  return sampleReviews.filter(
    (review) => review.productId === productId
  )
}
