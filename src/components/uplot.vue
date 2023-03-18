<script setup lang="ts">
import Uplot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { useElementSize, useVModel } from '@vueuse/core'
import { nextTick, onMounted, ref, watch } from 'vue'
import merge from '../utils/deepmerge'

export type Options = Omit<Uplot.Options, 'height' | 'width'>
export type AlignedData = Uplot.AlignedData

export interface Series {
  label: string | undefined
  stroke: string | null
  value: number | string | null | undefined
  data: number | null | undefined
  show: boolean | undefined
}

export type Cursor = Uplot.Cursor
export type Select = Uplot.Select

export interface UplotElement extends Partial<HTMLElement> {
  toggleShow: (serie: Series | number) => void
  uplot: Uplot
}

interface UplotProps {
  options: Options
  data: Uplot.AlignedData
  resetScale?: boolean
  showDebug?: boolean
  noFooter?: boolean
  zoom?: number[] | null[]
  series?: Series[]
}

const props = withDefaults(defineProps<UplotProps>(), {
  resetScale: false,
  showDebug: false,
  noFooter: false,
  zoom: () => [null, null],
})

const emit = defineEmits<{
  (e: 'select', select: Uplot.Select): void
  (e: 'cursor', cursor: Uplot.Cursor): void
  (e: 'update:zoom', zoom: number[]): void
  (e: 'update:series', series: Series[]): void
}>()
const el = ref<HTMLElement>()
const { width, height } = useElementSize(el)

// const series = ref<Serie[]>([])

const zoom = useVModel(props, 'zoom', emit, { passive: true })
const series = useVModel(props, 'series', emit, { passive: true })

const internalOptions: Omit<Options, 'series'> = {
  title: undefined,
  legend: {
    show: false,
  },
  hooks: {
    init: [
      (u) => {
        if (props.showDebug)
          console.log('init', u)
        // debugger
        series.value = u.series.map((s, i) => ({
          label: s.label,
          stroke: typeof s.stroke === 'function' ? s.stroke(u, i) as string : null,
          value: null,
          data: null,
          show: s.show,
          // ...s,
        }))
      },
    ],
    setCursor: [
      (u) => {
        emit('cursor', u.cursor)
        // console.log('setCursor', u)
        // console.log(props.data[0] === u.data[0])
        // debugger
        series.value = u.series.map((s, i) => ({
          label: s.label,
          stroke: typeof s.stroke === 'function' ? s.stroke(u, i) as string : null,
          value: (u.cursor.idx && u.data[i][u.cursor.idx]) ? (typeof s.value === 'function' ? s.value(u, u.data[i][u.cursor.idx] as number, i, u.cursor.idx) : u.data[i][u.cursor.idx]) : null,
          data: u.cursor?.idx ? u.data[i][u.cursor?.idx] : null,
          show: s.show,
          // ...s,
        }))
      },
    ],
    setSelect: [
      (u) => {
        emit('select', u.select)
        if (props.showDebug)
          console.log('setSelect', u.select)
        zoom.value = [
          u.posToVal(u.select.left, 'x'),
          u.posToVal(u.select.left + u.select.width, 'x'),
        ]
        // u.setScale('x', minMax);
      },
    ],
    setScale: [
      (u) => {
        // console.log('setScale', u)
        // debugger
        zoom.value = [
          u.scales.x.min || null,
          u.scales.x.max || null,
        ] as number[] | null[]
      }],
  },
}

let plot: Uplot
const uplot = ref()

function createUPlot() {
  if (plot)
    plot.destroy()

  plot = new Uplot({ width: 100, height: 100, ...(merge(props.options, internalOptions)) }, props.data, el.value)
  uplot.value = plot
  if (props.zoom[0] !== null && props.zoom[1] !== null)
    plot.setScale('x', { min: props.zoom[0], max: props.zoom[1] })

  setTimeout(() => {
    resize()
  }, 0)
}

onMounted(() => {
  createUPlot()
})

watch([width, height], () => {
  nextTick(() => {
    resize()
  })
})

watch(props.data, (newValue) => {
  if (props.resetScale) {
    plot.setData(newValue)
    return
  }
  plot.setData(newValue, true)
  plot.redraw()
})

watch(props.options, (newValue, oldValue) => {
  if (props.showDebug)
    console.log('watch options', newValue, oldValue)
  createUPlot()
})

// watch(() => props.zoom, (newValue, oldValue) => {
//   console.log('watch zoom', newValue, oldValue)
//   if (newValue[0] !== null && newValue[1] !== null) {
//     plot.setScale('x', {min: newValue[0], max: newValue[1]})
//   }
// })
function resize() {
  // const title = el.value?.querySelector('.u-title')?.clientHeight
  // const label = el.value?.querySelector('.u-legend')?.clientHeight
  // let newHeight = height.value - (label || 0) - (title || 0)
  // console.log('resize', height.value, title, label)
  // console.log('resize', newHeight)

  plot.setSize({ width: width.value, height: height.value })
  if (props.showDebug)
    console.log('resize', plot)
}

function toggleShow(idx: number | Series) {
  if (typeof idx === 'object')
    idx = series.value?.indexOf(idx) || -1
  plot.setSeries(idx, { show: !plot.series[idx].show })
  if (series.value?.[idx])
    series.value[idx].show = plot.series[idx].show
}

// const uplot = computed(() => plot)
defineExpose({ toggleShow, uplot })
</script>

<template>
  <div class="__uplot-root">
    <slot name="header" :series="series" :toggle-show="toggleShow" />
    <div ref="el" class="__uplot" />
    <div v-if="showDebug" class="extra-info">
      {{ width }}
      x
      {{ height }}
      <br>
      <pre style="text-align: left;">{{ series }}</pre>
    </div>
    <slot name="footer" :series="series" :toggle-show="toggleShow">
      <div class="__uplot-legend">
        <div v-for="(s, i) in series" :key="s.label" class="__uplot-legend-series" :class="[`__uplot-${s.label?.toLowerCase()}`, `__uplot-i-${i}`]" :style="{ backgroundColor: s.show ? '' : 'lightgrey' }" @click="toggleShow(i)">
          <span v-if="i !== 0" :style="{ color: s.stroke || 'black' }" class="__uplot-legend-label">{{ s.label }}</span>
          <span v-if="s.value" class="__uplot-legend-value">{{ s.value }}</span>
          <span v-else class="__uplot-legend-value">--</span>
        </div>
      </div>
    </slot>
  </div>
</template>

<style>
.__uplot {

  flex: 1 1 auto;
  min-height: 120px;
  position: relative;
}
.__uplot-root {
  /* position: relative; */
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.__uplot .uplot{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.__uplot-legend {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  padding: 0.5em;
  gap: 0.25em;
  font-size: 10px;
}

.__uplot-legend-series {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  padding: 5px;
  background-color: white;
  color: black;
  border: 1px solid lightgray;
  border-radius: 5px;
  min-width: 6em;
  min-height: 4em;
}
.__uplot-i-0 {
  min-width: 12em;
  justify-content: end;
}
.extra-info {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: white;
  color: black;
  padding: 5px;
  border: 1px solid black;
}
</style>
