import type {
  OptionGroup,
  CustomizationOption,
} from '@/models/customization'

export function validateCustomizationData(
  groups: OptionGroup[],
  options: CustomizationOption[]
): string[] {
  const errors: string[] = []

  // 1. Kiểm tra ID nhóm không trùng
  const groupIds = new Set<string>()

  for (const group of groups) {
    if (groupIds.has(group.id)) {
      errors.push(`ID nhóm bị trùng: ${group.id}`)
    }

    groupIds.add(group.id)
  }

  // 2. Kiểm tra thông tin và giới hạn của từng nhóm
  for (const group of groups) {
    if (!group.id.trim()) {
      errors.push('Nhóm có ID rỗng')
    }

    if (!group.productId.trim()) {
      errors.push(`Nhóm ${group.id} chưa có productId`)
    }

    if (!group.name.trim()) {
      errors.push(`Nhóm ${group.id} chưa có tên`)
    }

    if (
      group.selectionType !== 'SINGLE' &&
      group.selectionType !== 'MULTIPLE'
    ) {
      errors.push(`Nhóm ${group.id} có selectionType không hợp lệ`)
    }

    if (
      !Number.isInteger(group.minSelection) ||
      !Number.isInteger(group.maxSelection) ||
      group.minSelection < 0 ||
      group.maxSelection < 0 ||
      group.minSelection > group.maxSelection
    ) {
      errors.push(`Nhóm ${group.id} có giới hạn lựa chọn không hợp lệ`)
    }

    if (group.isRequired && group.minSelection < 1) {
      errors.push(`Nhóm bắt buộc ${group.id} phải có minSelection từ 1`)
    }

    if (
      group.selectionType === 'SINGLE' &&
      group.maxSelection > 1
    ) {
      errors.push(`Nhóm SINGLE ${group.id} không được chọn quá 1`)
    }
  }

  // 3. Kiểm tra ID lựa chọn không trùng và giá không âm
  const optionIds = new Set<string>()

  for (const option of options) {
    if (optionIds.has(option.id)) {
      errors.push(`ID lựa chọn bị trùng: ${option.id}`)
    }

    optionIds.add(option.id)

    if (!option.id.trim()) {
      errors.push('Lựa chọn có ID rỗng')
    }

    if (!option.name.trim()) {
      errors.push(`Lựa chọn ${option.id} chưa có tên`)
    }

    if (
      !Number.isFinite(option.additionalPrice) ||
      option.additionalPrice < 0
    ) {
      errors.push(`Lựa chọn ${option.id} có giá thêm không hợp lệ`)
    }

    if (typeof option.isActive !== 'boolean') {
      errors.push(`Lựa chọn ${option.id} có trạng thái không hợp lệ`)
    }

    if (!groupIds.has(option.groupId)) {
      errors.push(
        `Lựa chọn ${option.id} liên kết đến nhóm không tồn tại: ${option.groupId}`
      )
    }
  }

  // 4. Kiểm tra số lựa chọn tối thiểu so với dữ liệu đang áp dụng
  for (const group of groups) {
    const activeOptionCount = options.filter(
      (option) =>
        option.groupId === group.id && option.isActive
    ).length

    if (group.minSelection > activeOptionCount) {
      errors.push(
        `Nhóm ${group.id} yêu cầu tối thiểu ${group.minSelection} lựa chọn nhưng chỉ có ${activeOptionCount} lựa chọn đang áp dụng`
      )
    }
  }

  return errors
}