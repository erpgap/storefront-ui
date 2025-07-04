export default defineEventHandler(async (event) => {
  const data = Array.from(Array(2300).keys())

  const formatedData = data.map((item: number) => ({
    key: `stock:stock:product-${item}`, value: `{"1": ${Math.floor(Math.random() * 5)}}`,
  }))

  await useStorage('stock').setItems(formatedData)
})
