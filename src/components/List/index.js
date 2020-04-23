import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import classes from './styles.css'

const List = ({ data }) => { // takes a data prop
  // how many clicks have we counted? Default to 0
  const [count, setCount] = useState(0)

  // shared event handler
  const handleClick = () => {
    setCount(count + 1)
  }

  return html`
    <ul class="list ${classes.list}">
      ${data && data.map(i => html`
        <li class="item ${classes.item}">
          <!-- listen for button clicks -->
          ${i}: <button onClick=${handleClick}>Click me</button>
        </li>
      `)}
      <li class="item ${classes.item}">
        <!-- list how many clicks we've seen, with the right plural -->
        ${count} ${count === 1 ? 'click' : 'clicks'} counted
      </li>
    </ul>
  `
}

export default List
