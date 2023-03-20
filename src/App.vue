<script setup lang="ts">
import { ref } from 'vue'
import type { AlignedData, Cursor, Options, Select, Series, UplotElement } from './components/uplot.vue'
import Uplot from './components/uplot.vue'

const options = ref<Options>({
  series: [
    {},
    { label: 's1', stroke: 'red' },
    { label: 's2', stroke: 'green' },
    { label: 's3', stroke: 'blue' },
  ],
})
const noZoomOptions = ref<Options>({
  series: [
    {},
    { label: 's1', stroke: 'red' },
    { label: 's2', stroke: 'green' },
    { label: 's3', stroke: 'blue' },
  ],
  cursor: {
    drag: { setScale: false },
  },
})

const data = ref<AlignedData>(
  [
    [1654575670],
    [10],
    [10],
    [10],
  ],

)

const zoom = ref<number[] | null[]>([null, null])

let i = 0
const limit = 80
function newData() {
  Array.isArray(data.value[0]) && data.value[0].push(data.value[0][i] + 10000)
  for (let j = 1; j < options.value.series.length; j++) {
    if (!Array.isArray(data.value[j]))
      data.value[j] = [] as number[]
    (data.value[j] as number[])?.push((data.value[j][i] || 0) + (Math.random() - 0.5) * 10)
  }
}

while (i < limit) {
  newData()
  i++
}

function addSeries() {
  // console.log('addSeries')
  const newSeries = { label: `s${options.value.series.length}`, stroke: `#${Math.floor(Math.random() * 16777215).toString(16)}` }
  options.value.series.push(newSeries)
  noZoomOptions.value.series.push(newSeries)
  let foo = (Math.random() - 0.5) * 100
  // @ts-expect-error don't know how to fix this
  data.value.push(data.value[1].map(() => {
    foo = foo + (Math.random() - 0.5) * 10
    return foo
  }))
}
setInterval(() => {
  newData()
  i++
  if (i > limit) {
    i = limit
    for (let j = 0; j < options.value.series.length; j++)
      (data.value[j] as number[])?.shift()
  }
}, 1000)

const myseries = ref<Series[]>([])
const cursor = ref<Cursor>()
const select = ref<Select>()
const thePlot = ref(null as unknown as UplotElement)
</script>

<template>
  <div class="container mb-5">
    <div class="row">
      <div class="col-auto border">
        <textarea id="" name="" class="resize">
          Change the sizes of the textareaa and the plot to see the responsive behavior.
        </textarea>
      </div>
      <div class="col border">
        <Uplot :options="options" :data="data" reset-scale />
      </div>
    </div>
    <div class="row">
      <div class="col-auto border">
        <textarea id="" name="" class="resize" />
      </div>
      <div class="col border">
        <Uplot v-model:zoom="zoom" :options="options" :data="data">
          <template #header="{ series, toggleShow }">
            <div class="d-flex gap-3 flex-wrap">
              <div v-for="s in series" :key="s.label" class="legend-item" @click="toggleShow(s)">
                <div class="badge badge" :style="{ backgroundColor: s.show ? s.stroke || 'var(--bs-secondary)' : 'lightgrey' }">
                  {{ s.label }} : {{ s.value || '--' }} {{ s.show }}
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <span />
          </template>
        </Uplot>
      </div>
    </div>

    <div class="row">
      <div class="col-auto border">
        <div v-for="series, index in myseries" :key="index" class="btn position-relative d-block m-1 mb-5" :class="{ 'btn-primary': series.show, 'btn-secondary': !series.show }" @click="thePlot.toggleShow(index)">
          {{ series.label }}
          <template v-if="series.value">
            <div class="position-absolute top-100 end-0 border text-body bg-body text-nowrap p-1 rounded">
              {{ series.value }}
            </div>
          </template>
        </div>
      </div>
      <div class="col border" style="min-height: 400px;">
        <Uplot
          ref="thePlot"
          v-model:series="myseries"
          :options="noZoomOptions"
          :data="data"
          reset-scale
          no-footer
          @cursor="cursor = $event" @select="select = $event"
        />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div>
          cursor: {{ cursor }}
        </div>
        <div>
          cursor to value: {{ thePlot?.uplot && thePlot.uplot.posToVal(cursor?.left || 0, 'x') }}
        </div>
        <div>
          select: {{ select }}
        </div>
      </div>
    </div>
    <button class="btn btn-primary" @click="addSeries()">
      Add series
    </button>
    <button class="btn btn-primary" @click="options.padding = [Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50]">
      random padding
    </button>
    <div> {{ zoom }}</div>
    <button class="btn btn-primary" @click="zoom = [(zoom[0] || 0) + 24 * 60 * 60, (zoom[1] || 0) - 24 * 60 * 60]">
      zoom
    </button>
    <div class="resize" style="height: 400px;">
      <Uplot :options="options" :data="data" />
    </div>
  </div>
</template>

<style scoped>
.resize{

  resize: both;
  overflow: auto;
  border: 1px red solid;
  padding: 1em;
  min-width: 200px;
  min-height: 200px;

}
</style>
