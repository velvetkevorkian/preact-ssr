/* eslint-env mocha */
import { expect } from 'chai'
import { html } from 'htm/preact'
import { mount } from 'enzyme'
import PreactApp from '.'

let wrapper

describe('PreactApp', () => {
  beforeEach(() => {
    wrapper = mount(html`<${PreactApp} />`)
  })
  it('renders a list', () => {
    expect(wrapper.find('ul').exists()).to.be.true
  })

  it('renders four items by default', () => {
    expect(wrapper.find('li').length).to.equal(4)
  })

  it('adds an item when the button is clicked', () => {
    const button = wrapper.find('button').last()
    button.simulate('click')
    wrapper.update()
    expect(wrapper.find('li').length).to.equal(5)
  })
})
