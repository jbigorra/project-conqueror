export const extractParameters = (input: Record<string, unknown>): Record<string, unknown> => {
  const { format, ...params } = input
  return params
}
