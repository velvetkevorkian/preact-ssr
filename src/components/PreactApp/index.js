import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import List from '../List'
import classes from './styles.css'

const PreactApp = () => {
  const [dataArray, setDataArray] = useState(['Item 1', 'Item 2', 'Item 3'])

  const addItem = () => setDataArray([
    ...dataArray,
    `Item ${dataArray.length + 1}`,
  ])

  return html`
    <${List} data=${dataArray} />
    <button class="button ${classes.button}" type="button" onclick=${addItem}>
      Add item
    </button>
  `
}

export default PreactApp
