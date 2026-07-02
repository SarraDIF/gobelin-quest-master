export function cartesianProduct(arrays: any[][]): any[][] {
  return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]])
}

export function makeVariantCombinations(spec: Record<string, string[]>): Record<string, string>[] {
  const keys = Object.keys(spec)
  const lists = keys.map(k => spec[k] || [])
  if (lists.length === 0) return []
  const product = cartesianProduct(lists)
  return product.map(combo => {
    const obj: Record<string, string> = {}
    combo.forEach((val, idx) => {
      obj[keys[idx]] = val
    })
    return obj
  })
}
