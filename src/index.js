import _ from 'lodash'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import p5 from 'p5'
import runShades from './shades.js'

let shades = document.getElementById('shades')
if (shades) {runShades(shades)}
