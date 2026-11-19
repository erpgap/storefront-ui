/**
 * What the page needs to show the website's logo: its address, which changes
 * with the image, its size and its text alternative. Null when there is no
 * logo to show (server/utils/websiteLogo.ts).
 */
export default defineEventHandler(async (event) => {
  const logo = await websiteLogo(event)
  if (!logo) return null
  return {
    src: `/website-logo?v=${logo.version}`,
    width: logo.width,
    height: logo.height,
    alt: logo.name,
  }
})
