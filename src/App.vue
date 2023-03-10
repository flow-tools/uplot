<script setup lang="ts">
import { ref } from 'vue'
import type { AlignedData, Options, Serie } from './components/uplot.vue'
import Uplot from './components/uplot.vue'

const options = ref<Options>({
  series: [
    {},
    { label: 's1', stroke: 'red' },
    { label: 's2', stroke: 'green' },
    { label: 's3', stroke: 'blue' },
  ],
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
  options.value.series.push({ label: `s${options.value.series.length}`, stroke: `#${Math.floor(Math.random() * 16777215).toString(16)}` })
  let foo = (Math.random() - 0.5) * 100
  // @ts-expect-error don't know how to fix this
  data.value.push(data.value[1].map(() => {
    foo = foo + (Math.random() - 0.5) * 10
    return foo
  }))
  newData()
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

const myseries = ref<Serie[]>([])
const thePlot = ref(null)
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-auto border">
        <textarea id="" name="" class="resize" />
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
            <div class="d-flex gap-3">
              <div v-for="s, i in series" :key="s.label" class="legend-item" @click="toggleShow(i)">
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
        <div v-for="serie, index in myseries" :key="index" class="btn d-block m-1" :class="{ 'btn-primary': serie.show, 'btn-secondary': !serie.show }" @click="thePlot.toggleShow(index)">
          {{ serie.label }}
        </div>
      </div>
      <div class="col border" style="min-height: 400px;">
        <Uplot ref="thePlot" v-model:series="myseries" :options="options" :data="data" reset-scale />
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
    <div class="resize">
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
  min-width: 300px;
  min-height: 300px;
  /* display: flex; */

}
</style>
