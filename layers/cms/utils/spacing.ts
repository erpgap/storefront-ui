// The `spacing` option shared by blocks that stack into one flow of content
// (see spacingField in shared/cms/blocks.ts). The values reproduce the rhythm
// the hand-built content pages had: ~96px below a banner, ~56px between parts.

export type BlockSpacing = 'normal' | 'start' | 'compact' | 'end'

const BETWEEN = 'pb-[clamp(40px,4.5vw,56px)]'

export function spacingClass(spacing: BlockSpacing | undefined): string {
  switch (spacing) {
    case 'start':
      return `pt-[clamp(48px,7vw,96px)] ${BETWEEN}`
    case 'compact':
      return BETWEEN
    case 'end':
      return 'pb-[clamp(48px,7vw,96px)]'
    default:
      return 'py-[clamp(56px,7vw,104px)]'
  }
}
