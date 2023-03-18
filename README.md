# Vue 3 uplot that is responsive

## Demo

[StackBlitz](https://stackblitz.com/edit/vitejs-vite-dhtmxj?file=src/App.vue)

## usage

```shell
pnpm add @flowtools/uplot uplot @vueuse/core
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { AlignedData, Options } from '@flowtools/uplot'
import { Uplot } from '@flowtools/uplot'

const options = ref<Options>({
  series: [
    {},
    { label: 's1', stroke: 'red' },
    { label: 's2', stroke: 'green' },
    { label: 's3', stroke: 'blue' },
  ],
})
const data = ref<AlignedData>([[1654575670], [10], [10], [10]])
</script>

<template>
  <Uplot :options="options" :data="data" />
</template>
```

## Customizing

You can use header and footer slots to add or customize the header and legend. Both slots receive the same props: series an array of series and toggleShow a function to toggle the show value of the series.

```vue
<template>
  <Uplot :options="options" :data="data">
    <template #header>
      <h2>Header</h2>
    </template>
    <template #footer="{ series, toggleShow }">
      <div class="d-flex gap-3">
        <div v-for="s in series" :key="s.label" class="legend-item" @click="toggleShow(s)">
          <div class="badge" :style="{ backgroundColor: s.show ? s.stroke || 'var(--bs-secondary)' : 'lightgrey' }">
            {{ s.label }} : {{ s.value || '--' }} {{ s.show }}
          </div>
        </div>
      </div>
    </template>
  </Uplot>
</template>

## Interacting with the uplot

There are many examples of interacting with the chart in the [uplot demos](https://leeoniya.github.io/uPlot/demos/).

The component emits events for series, cursor, and selection. You can use these events to get data from the component.

One way to interact with the chart is to use the `ref` prop to get a reference to the uplot component that exposes the uplot instance. Then you can use the [uplot API](https://leeoniya.github.io/uPlot/docs/api.html) to interact with the chart.

For more information see [App.vue in the repo](https://github.com/flow-tools/uplot/blob/main/src/App.vue).
