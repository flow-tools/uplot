import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { Uplot } from '../src/index'

const slotText = 'Test content'
const props = {
  data: [[1, 2, 3], [1, 2, 3]],
  options: {
    series: [
      {},
      {},
    ],
  },
}

describe('Uplot', () => {
  test('header render', () => {
    const wrapper = mount(Uplot, {
      props,
      slots: {
        header: slotText,
      },
    })

    expect(wrapper.text()).toBe(slotText)
  })

  test('footer render', () => {
    const wrapper = mount(Uplot, {
      props,
      slots: {
        footer: slotText,
      },
    })

    expect(wrapper.text()).toBe(slotText)
  })
})
