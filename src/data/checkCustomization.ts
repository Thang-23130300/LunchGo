import { optionGroups } from '@/data/optionGroups'
import { options } from '@/data/options'
import { validateCustomizationData } from '@/utils/validateCustomization'

const errors = validateCustomizationData(optionGroups, options)

if (errors.length > 0) {
  console.error('DỮ LIỆU TÙY CHỌN CÓ LỖI:')

  errors.forEach((error, index) => {
    console.error(`${index + 1}. ${error}`)
  })
} else {
  console.log('DỮ LIỆU TÙY CHỌN HỢP LỆ!')
  console.log(`Số nhóm tùy chọn: ${optionGroups.length}`)
  console.log(`Số lựa chọn: ${options.length}`)
}