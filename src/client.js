if (process.env.NODE_ENV === 'development') {
  require('preact/debug')
}
import { html } from 'htm/preact'
import { hydrate } from 'preact'
import PreactApp from './components/PreactApp'

const app = html`<${PreactApp} />`
const el = document.getElementById('root')
hydrate(app, el)
