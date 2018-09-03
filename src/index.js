import _ from 'lodash'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import p5 from 'p5'
import runShades from './shades.js'
import runSpiro from './spiro.js'

let shades = document.getElementById('shades')
if (shades) {runShades(shades)}

let spiro = document.getElementById('spiro')
if (spiro) {runSpiro(spiro)}
