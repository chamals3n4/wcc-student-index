export const HOUSES = ["Vijaya", "Gamunu", "Parakum", "Thissa"] as const

export type House = (typeof HOUSES)[number]

export function getHouseFromIndexNumber(indexNumber: string): House {
  const num = parseInt(indexNumber, 10)

  if (isNaN(num)) {
    throw new Error(
      `Invalid index number: "${indexNumber}" is not a valid number`
    )
  }
  return HOUSES[num % 4]
}
