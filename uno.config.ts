import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    // Add your custom shortcuts here
  ],
  theme: {
    colors: {
      // Add custom colors here
    },
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: [
    'i-ph-house-fill',
    'i-simple-icons-ubuntu',
    'i-simple-icons-apple',
    'inline-flex',
    'items-center',
    'gap-1',
  ],
})
