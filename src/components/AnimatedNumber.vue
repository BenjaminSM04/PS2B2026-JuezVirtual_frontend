<template>
  <span>{{ displayValue }}</span>
</template>

<script>
  // Contador animado (count-up) sin dependencias. Hace tween del número de
  // `from` a `value` con easeOutCubic. Respeta prefers-reduced-motion y degrada
  // a valor instantáneo. Pensado para enteros (envíos, aceptados, totales).
  export default {
    name: 'AnimatedNumber',
    props: {
      value: {
        type: Number,
        default: 0
      },
      duration: {
        type: Number,
        default: 700
      }
    },
    data () {
      return {
        displayValue: 0,
        rafId: null
      }
    },
    mounted () {
      this.animate(0, this.value)
    },
    watch: {
      value (newVal) {
        this.animate(this.displayValue, newVal)
      }
    },
    beforeDestroy () {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId)
      }
    },
    methods: {
      prefersReducedMotion () {
        return typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
      },
      animate (from, to) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId)
          this.rafId = null
        }
        const target = Number(to) || 0
        const start = Number(from) || 0
        if (this.prefersReducedMotion() || this.duration <= 0 || start === target) {
          this.displayValue = target
          return
        }
        const diff = target - start
        const startTime = performance.now()
        const ease = t => 1 - Math.pow(1 - t, 3)
        const step = now => {
          const progress = Math.min((now - startTime) / this.duration, 1)
          this.displayValue = Math.round(start + diff * ease(progress))
          if (progress < 1) {
            this.rafId = requestAnimationFrame(step)
          } else {
            this.displayValue = target
            this.rafId = null
          }
        }
        this.rafId = requestAnimationFrame(step)
      }
    }
  }
</script>
