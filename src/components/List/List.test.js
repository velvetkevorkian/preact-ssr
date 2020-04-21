/* eslint-env mocha */
import { expect } from 'chai'
import { html } from 'htm/preact'
import { mount } from 'enzyme'
import List from '.'

let wrapper
const data = ['foo', 'bar']

describe('List component', () => {
  before(() => {
    wrapper = mount(html`<${List} data=${data}/>`)
  })

  it('renders an item for each data element, plus one extra', () => {
    const items = wrapper.find('li')
    expect(items).to.have.lengthOf(3)
  })

  it('has a last item that counts clicks', () => {
    const item = wrapper.find('li').at(2)
    expect(item.text()).to.include('0 clicks counted')
  })

  it('clicking a button increments the counter', () => {
    const button = wrapper.find('button').at(0)
    button.simulate('click')
    const item = wrapper.find('li').at(2)
    expect(item.text()).to.include('1 click counted')
  })
})
