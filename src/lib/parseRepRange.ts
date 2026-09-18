/** Derives a single starting rep target from a rep range string like "8-12" or "10-12 לכל רגל". */
export function parseTargetReps(repRange: string): number | null {
  const numbers = repRange.match(/\d+/g)?.map(Number) ?? []
  if (numbers.length === 0) return null
  if (numbers.length === 1) return numbers[0]
  return Math.round((numbers[0] + numbers[1]) / 2)
}
