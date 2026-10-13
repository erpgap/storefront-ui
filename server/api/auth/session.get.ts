export default defineEventHandler((event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  const valid = isLoginSessionValid(event)
  if (!valid) clearStorefrontLogin(event)

  return { valid }
})
