import _ from 'lodash'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import p5 from 'p5'
import runShades from './shades.js'
import runSpiro from './spiro.js'
import runMicromovements from './micromovements.js'

const shades = document.getElementById('shades')
if (shades) {runShades(shades)}

const spiro = document.getElementById('spiro')
if (spiro) {runSpiro(spiro)}

const micromovements = document.getElementById('micromovements')
if (micromovements) {runMicromovements(micromovements)}
