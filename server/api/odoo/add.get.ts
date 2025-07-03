export default defineEventHandler(async (event) => {
  const data = Array.from(Array(2300).keys())

  const formatedData = data.map((item: number) => ({
    key: `stock:product-${item}`, value: { 1: 4 },
  }))

  await useStorage('stock').setItems(formatedData)
})
