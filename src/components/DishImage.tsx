import { useState, type ImgHTMLAttributes } from 'react'
import defaultDishImage from '@/assets/home/bunbo.webp'

const dishImages = import.meta.glob<string>('/src/assets/products/**/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
})

type DishImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onError'> & {
  src: string
  name: string
}

function DishImage({ src, name, className, ...props }: DishImageProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const imageSrc = src.startsWith('/products/')
    ? dishImages[`/src/assets${src}`] || defaultDishImage
    : src || defaultDishImage

  if (failedSrc === imageSrc) {
    return <span className={`${className ?? ''} dish-image-placeholder`} aria-hidden="true">{name}</span>
  }

  return <img {...props} className={className} src={imageSrc} alt="" onError={() => setFailedSrc(imageSrc)} />
}

export default DishImage
