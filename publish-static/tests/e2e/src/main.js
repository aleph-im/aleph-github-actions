import './style.css'
import { randomBytes } from './randombytes.js'

document.querySelector('#app').innerHTML = `
  <div>
    ${randomBytes}
  </div>
`