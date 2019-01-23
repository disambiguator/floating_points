import _ from 'lodash'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import runSpiro from './spiro.js'
import runMicromovements from './micromovements.js'

const spiro = document.getElementById('spiro')
if (spiro) {runSpiro(spiro)}

const micromovements = document.getElementById('micromovements')
if (micromovements) {runMicromovements(micromovements)}
