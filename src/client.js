import { html } from 'htm/preact'
import { hydrate } from 'preact'
import PreactApp from './components/PreactApp'

const app = html`<${PreactApp} />`
const el = document.getElementById('root')
hydrate(app, el)
