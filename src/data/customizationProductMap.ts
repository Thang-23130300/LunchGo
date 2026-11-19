export const customizationProductMap: Record<string, string> = {
  'local:550e8400-e29b-41d4-a716-446655440002': 'FOOD015',
  'local:550e8400-e29b-41d4-a716-446655440013': 'FOOD016',
  'local:550e8400-e29b-41d4-a716-446655440017': 'FOOD021',
}

export function getCustomizationProductId(productId: string): string {
  return customizationProductMap[productId] ?? productId
}