import { describe, expect, it } from 'vitest'
import { formatAmount } from './formatAmount'

const NBSP = '\u00A0'
const usd = { symbol: '$', position: 'before', decimalPlaces: 2, decimalSeparator: '.', thousandsSeparator: ',' }

describe('formatAmount', () => {
  it('formats as Odoo does: symbol before, no-break space, grouped thousands', () => {
    expect(formatAmount(1234.5, usd)).toBe(`$${NBSP}1,234.50`)
  })

  it('follows the position and separators the API sends', () => {
    const eur = { symbol: '€', position: 'after', decimalPlaces: 2, decimalSeparator: ',', thousandsSeparator: '.' }
    expect(formatAmount(1234567.891, eur)).toBe(`1.234.567,89${NBSP}€`)
  })

  it('rounds half up as Odoo does, where toFixed rounds down', () => {
    expect((125.955).toFixed(2)).toBe('125.95')
    expect(formatAmount(125.955, usd)).toBe(`$${NBSP}125.96`)
    expect(formatAmount(1.005, usd)).toBe(`$${NBSP}1.01`)
    expect(formatAmount(0, usd)).toBe(`$${NBSP}0.00`)
  })

  it('follows the currency decimals', () => {
    expect(formatAmount(1500, { ...usd, symbol: '¥', decimalPlaces: 0 })).toBe(`¥${NBSP}1,500`)
  })

  it('keeps the sign of negative amounts', () => {
    expect(formatAmount(-10, usd)).toBe(`$${NBSP}-10.00`)
  })

  it('formats nothing without a currency', () => {
    expect(formatAmount(10, null)).toBe('')
  })
})
