/** components/common/BaseButton.vue 테스트 - 컴포넌트를 실제로 그려 보고 확인한다. */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('slot 내용과 variant / size 클래스를 그린다', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'danger', size: 'sm' },
      slots: { default: '삭제' },
    })

    expect(wrapper.text()).toBe('삭제')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['btn--danger', 'btn--sm']))
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('loading 중에는 스피너를 보여 주고 누를 수 없다', async () => {
    const wrapper = mount(BaseButton, { props: { loading: true } })

    expect(wrapper.find('.btn__spinner').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBeDefined()

    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.btn__spinner').exists()).toBe(false)
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })
})
