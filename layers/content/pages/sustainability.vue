<script setup lang="ts">
useHead({
  title: 'Sustainability — Alokai',
  meta: [{ name: 'description', content: 'Our approach to materials, making and responsibility.' }],
})

const commitments = [
  { title: 'Natural materials', text: 'Organic cotton, pure linen and responsibly sourced leather — fibres chosen to last and to age well.' },
  { title: 'Made to last', text: 'We design against the trend cycle. Fewer, better pieces mean less waste over a garment\'s life.' },
  { title: 'Lower-impact shipping', text: 'Recyclable, plastic-free packaging and carbon-aware carriers on every order.' },
  { title: 'Transparent sourcing', text: 'We work with partners who share our standards on materials, labour and traceability.' },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="Our responsibility"
      title="Made to last, made with care"
      subtitle="Considered design is the most sustainable design — here's how we approach it."
      image="/img/content/sustainability-banner.webp"
    />

    <!-- Intro -->
    <section class="narrow-container py-[clamp(56px,8vw,120px)] max-w-[820px]">
      <ContentDemoNote class="mb-12" />
      <p class="text-[clamp(20px,2.4vw,30px)] font-light leading-snug tracking-[-0.01em]">
        We believe the most responsible product is one you keep for years. That principle shapes the
        materials we choose, the way we make, and how we get it to you.
      </p>
    </section>

    <!-- Commitments -->
    <section class="border-y border-primary-100">
      <div class="narrow-container grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 py-[clamp(48px,6vw,88px)]">
        <div v-for="(c, i) in commitments" :key="c.title" class="flex gap-5">
          <span class="text-[13px] font-medium text-primary-300 pt-1">0{{ i + 1 }}</span>
          <div>
            <h3 class="text-[20px] font-medium mb-2">{{ c.title }}</h3>
            <p class="text-primary-500 font-light leading-relaxed max-w-[440px]">{{ c.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Editorial split -->
    <section class="grid grid-cols-1 md:grid-cols-2 items-stretch">
      <div class="bg-primary-50 flex flex-col justify-center p-[clamp(40px,6vw,96px)] md:order-1 order-2">
        <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400">A work in progress</p>
        <h2 class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)] my-5">
          Honest about the journey
        </h2>
        <p class="font-light text-primary-500 max-w-[440px] leading-relaxed">
          We don't claim to be perfect. Sustainability is a direction, not a badge — and we'd rather
          share real progress than greenwash. This is a demo showcase, but the principles reflect how
          we'd build a responsible brand.
        </p>
      </div>
      <NuxtImg
        src="/img/content/sustainability-editorial.webp"
        alt="Considered craft"
        width="896"
        height="1088"
        sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw"
        densities="1x"
        class="w-full h-full min-h-[360px] md:min-h-[520px] object-cover object-center md:order-2 order-1"
        loading="lazy"
      />
    </section>
  </div>
</template>
