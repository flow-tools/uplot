import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Uplot } from '../src'

const slotText = 'Test content'
const props = {
  data: [new Float64Array([1, 2, 3]), new Float64Array([1, 2, 3])],
  options: {
    series: [
      {},
      {},
    ],
  },
}

describe('uplot', () => {
  it('header render', () => {
    const wrapper = mount(Uplot, {
      props,
      slots: {
        header: slotText,
      },
    })

    expect(wrapper.text()).toBe(slotText)
  })

  it('footer render', () => {
    const wrapper = mount(Uplot, {
      props,
      slots: {
        footer: slotText,
      },
    })

    expect(wrapper.text()).toBe(slotText)
  })
})
