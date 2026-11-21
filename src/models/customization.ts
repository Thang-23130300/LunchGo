
export type SelectionType = 'SINGLE' | 'MULTIPLE';

// Nhóm tùy chọn của một sản phẩm
export interface OptionGroup {
  id: string;
  productId: string;
  name: string;
  selectionType: SelectionType;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
}

// Một lựa chọn trong nhóm
export interface Option {
  id: string;
  groupId: string;
  name: string;
  additionalPrice: number;
  isActive: boolean;
}

export type CustomizationOption = Option

export type SelectedOption = Pick<Option, 'id' | 'name' | 'additionalPrice'>
