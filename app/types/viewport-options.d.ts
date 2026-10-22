// The options template nuxt-viewport writes (#viewport-options), which it
// ships without a declaration. Read by app/plugins/0.viewport-device.server.ts.
declare module '#viewport-options' {
  const options: {
    breakpoints: Record<string, number>
    defaultBreakpoints: Record<string, string>
    fallbackBreakpoint: string
  }
  export default options
}
