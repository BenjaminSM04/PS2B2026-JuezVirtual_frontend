<template>
  <svg
    class="lizard-mascot"
    :class="['lizard-mascot--' + stage, {'is-animated': animated, 'is-cheering': cheering}]"
    viewBox="0 0 200 200"
    aria-hidden="true"
    focusable="false"
  >
    <ellipse class="lizard-mascot__shadow" cx="100" cy="188" rx="50" ry="7" />

    <g v-if="stage === 'egg'" class="lizard-mascot__egg">
      <path
        d="M100 46C134 46 150 100 150 128C150 160 127 182 100 182C73 182 50 160 50 128C50 100 66 46 100 46Z"
        fill="#f7efdc"
        stroke="#e2cfa6"
        stroke-width="2.5"
      />
      <circle cx="80" cy="96" r="8" :fill="palette.body" opacity=".55" />
      <circle cx="118" cy="82" r="5.5" :fill="palette.body" opacity=".5" />
      <circle cx="122" cy="138" r="9" :fill="palette.body" opacity=".5" />
      <circle cx="82" cy="154" r="5.5" :fill="palette.body" opacity=".5" />
      <circle cx="104" cy="164" r="3.5" :fill="palette.body" opacity=".45" />
      <path
        d="M66 118 78 110 87 121 99 107 110 121 121 109 134 118"
        fill="none"
        stroke="#c7b183"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M86 70Q92 62 100 62" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8" />
    </g>

    <g v-else class="lizard-mascot__body" :transform="stageTransform">
      <g v-if="accessory === 'backpack'">
        <rect x="48" y="104" width="104" height="66" rx="22" fill="#b07a43" stroke="#7a5230" stroke-width="3" />
        <rect x="44" y="132" width="14" height="26" rx="6" fill="#c98f52" stroke="#7a5230" stroke-width="2.5" />
        <rect x="142" y="132" width="14" height="26" rx="6" fill="#c98f52" stroke="#7a5230" stroke-width="2.5" />
      </g>

      <g class="lizard-mascot__tail" :stroke="palette.body" fill="none" stroke-linecap="round">
        <path d="M120 162C148 172 174 164 178 142C181 126 170 116 160 120" stroke-width="15" />
        <path d="M160 120C152 123 152 133 160 134" stroke-width="8" />
      </g>

      <g :fill="palette.body">
        <ellipse cx="80" cy="177" rx="14" ry="8" />
        <ellipse cx="120" cy="177" rx="14" ry="8" />
      </g>
      <g :fill="palette.belly">
        <circle cx="72" cy="181" r="3.2" /><circle cx="80" cy="183" r="3.2" /><circle cx="88" cy="181" r="3.2" />
        <circle cx="112" cy="181" r="3.2" /><circle cx="120" cy="183" r="3.2" /><circle cx="128" cy="181" r="3.2" />
      </g>

      <ellipse cx="100" cy="144" rx="37" ry="36" :fill="palette.body" />
      <ellipse cx="100" cy="152" rx="23" ry="25" :fill="palette.belly" />
      <path
        d="M84 144Q100 149 116 144M86 156Q100 161 114 156M89 167Q100 171 111 167"
        :stroke="palette.shade"
        stroke-width="2"
        fill="none"
        opacity=".25"
        stroke-linecap="round"
      />
      <circle cx="70" cy="136" r="4" :fill="palette.shade" opacity=".5" />
      <circle cx="131" cy="150" r="3.5" :fill="palette.shade" opacity=".5" />

      <g class="lizard-mascot__arms" :fill="palette.body">
        <ellipse cx="67" cy="146" rx="9" ry="14" transform="rotate(22 67 146)" />
        <ellipse cx="133" cy="146" rx="9" ry="14" transform="rotate(-22 133 146)" />
      </g>
      <g :fill="palette.belly">
        <circle cx="61" cy="158" r="2.6" /><circle cx="66" cy="160" r="2.6" />
        <circle cx="139" cy="158" r="2.6" /><circle cx="134" cy="160" r="2.6" />
      </g>

      <g v-if="accessory === 'backpack'" stroke="#7a5230" stroke-width="5" stroke-linecap="round">
        <path d="M82 112 79 150" /><path d="M118 112 121 150" />
      </g>

      <g v-if="accessory === 'scarf'">
        <path d="M118 124 127 152 116 150 110 128Z" fill="#a63358" />
        <path d="M120 136 124 135M121 143 126 142" stroke="#f6c9d6" stroke-width="2" stroke-linecap="round" />
        <path d="M63 111Q100 128 137 111L135 122Q100 138 65 122Z" fill="#8b2346" />
        <circle cx="117" cy="125" r="6" fill="#a63358" />
      </g>

      <g class="lizard-mascot__head">
        <g v-if="stage !== 'baby'" :fill="palette.shade">
          <path d="M88 48 94 30 101 46Z" />
          <path d="M99 46 106 28 112 46Z" />
          <path d="M110 48 118 34 121 51Z" />
          <template v-if="stage === 'adult'">
            <path d="M77 54 81 38 89 50Z" />
            <path d="M120 52 130 40 130 57Z" />
          </template>
        </g>

        <ellipse cx="100" cy="86" rx="51" ry="41" :fill="palette.body" />
        <circle cx="72" cy="64" r="4" :fill="palette.shade" opacity=".45" />
        <circle cx="130" cy="60" r="3" :fill="palette.shade" opacity=".45" />
        <circle cx="121" cy="50" r="2.5" :fill="palette.shade" opacity=".45" />

        <circle cx="77" cy="68" r="18" :fill="palette.body" />
        <circle cx="123" cy="68" r="18" :fill="palette.body" />
        <circle cx="77" cy="68" r="12.5" fill="#fff" />
        <circle cx="123" cy="68" r="12.5" fill="#fff" />
        <circle class="lizard-mascot__pupil" cx="79" cy="70" r="7.2" fill="#23302b" />
        <circle class="lizard-mascot__pupil" cx="125" cy="70" r="7.2" fill="#23302b" />
        <circle cx="82" cy="66" r="2.6" fill="#fff" />
        <circle cx="128" cy="66" r="2.6" fill="#fff" />
        <g class="lizard-mascot__eyelids" :fill="palette.body">
          <ellipse cx="77" cy="68" rx="13.5" ry="13.5" />
          <ellipse cx="123" cy="68" rx="13.5" ry="13.5" />
        </g>

        <ellipse cx="65" cy="96" rx="8" ry="5" fill="#f3a9bf" opacity=".55" />
        <ellipse cx="135" cy="96" rx="8" ry="5" fill="#f3a9bf" opacity=".55" />
        <circle cx="94" cy="90" r="1.9" :fill="palette.shade" />
        <circle cx="106" cy="90" r="1.9" :fill="palette.shade" />
        <path
          v-if="cheering"
          d="M86 99Q100 116 114 99Z"
          fill="#7a2140"
          stroke="#23302b"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
        <path v-else d="M85 100Q100 112 115 100" stroke="#23302b" stroke-width="3" fill="none" stroke-linecap="round" />

        <g v-if="accessory === 'glasses'" fill="rgba(255,255,255,.14)" stroke="#2f2a44" stroke-width="3.5">
          <circle cx="77" cy="68" r="16" />
          <circle cx="123" cy="68" r="16" />
          <path d="M93 66Q100 61 107 66" fill="none" />
        </g>

        <path
          v-if="stage === 'baby'"
          d="M66 52C72 30 128 30 134 52L126 46 118 55 109 45 100 55 91 45 82 55 74 46Z"
          fill="#f7efdc"
          stroke="#e2cfa6"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </g>
    </g>

    <g v-if="cheering" class="lizard-mascot__sparkles" fill="#f2b84b">
      <path d="M34 50 37 59 46 62 37 65 34 74 31 65 22 62 31 59Z" />
      <path d="M166 40 168 46 174 48 168 50 166 56 164 50 158 48 164 46Z" />
      <path d="M170 92 172 97 177 99 172 101 170 106 168 101 163 99 168 97Z" />
    </g>
  </svg>
</template>

<script>
import {PALETTES} from '@/utils/mascot'

export default {
  name: 'LizardMascot',
  props: {
    stage: {type: String, default: 'egg'},
    color: {type: String, default: 'green'},
    accessory: {type: String, default: 'none'},
    animated: {type: Boolean, default: true},
    cheering: {type: Boolean, default: false}
  },
  computed: {
    palette () {
      return PALETTES[this.color] || PALETTES.green
    },
    stageTransform () {
      // Las crías son más pequeñas; se escalan desde el suelo para no flotar.
      const scale = {baby: 0.8, juvenile: 0.92, adult: 1}[this.stage] || 1
      return 'translate(100 188) scale(' + scale + ') translate(-100 -188)'
    }
  }
}
</script>

<style scoped>
.lizard-mascot { display: block; width: 100%; height: auto; overflow: visible; }
.lizard-mascot__shadow { fill: rgba(20, 50, 40, .12); }
.lizard-mascot__eyelids ellipse { transform-box: fill-box; transform-origin: 50% 0; transform: scaleY(0); }
.lizard-mascot__tail, .lizard-mascot__head, .lizard-mascot__egg, .lizard-mascot__body { transform-box: view-box; }
.lizard-mascot__tail { transform-origin: 122px 162px; }
.lizard-mascot__head { transform-origin: 100px 120px; }
.lizard-mascot__egg { transform-origin: 100px 182px; }

.is-animated .lizard-mascot__eyelids ellipse { animation: lizard-blink 5.5s infinite; }
.is-animated .lizard-mascot__tail { animation: lizard-tail 3.4s ease-in-out infinite; }
.is-animated .lizard-mascot__head { animation: lizard-head 6s ease-in-out infinite; }
.is-animated .lizard-mascot__egg { animation: lizard-wobble 3s ease-in-out infinite; }
.is-animated.is-cheering .lizard-mascot__body { animation: lizard-hop .7s ease-out 2; }
.is-animated .lizard-mascot__sparkles { animation: lizard-twinkle 1.4s ease-in-out infinite; }

@keyframes lizard-blink {
  0%, 93%, 100% { transform: scaleY(0); }
  95.5% { transform: scaleY(1); }
}
@keyframes lizard-tail {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-9deg); }
}
@keyframes lizard-head {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
}
@keyframes lizard-wobble {
  0%, 60%, 100% { transform: rotate(0deg); }
  70% { transform: rotate(-5deg); }
  80% { transform: rotate(4deg); }
  90% { transform: rotate(-2deg); }
}
@keyframes lizard-hop {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-14px); }
}
@keyframes lizard-twinkle {
  0%, 100% { opacity: .35; }
  50% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .lizard-mascot * { animation: none !important; }
}
</style>
