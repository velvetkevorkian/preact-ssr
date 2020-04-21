import { JSDOM } from 'jsdom'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-preact-pure'

const dom = new JSDOM('', {
  pretendToBeVisual: true,
})

global.Event = dom.window.Event
global.Node = dom.window.Node
global.window = dom.window
global.document = dom.window.document
global.requestAnimationFrame = dom.window.requestAnimationFrame

configure({ adapter: new Adapter() })
