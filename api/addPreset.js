import {airtablePut} from '../lib/airtable'

const addToPositions = (seed) => airtablePut('position', seed)

module.exports = (req, res) => {
  if (req.method === 'POST') {
    const positionRequest = JSON.parse(req.body).seeds.map((seed) => addToPositions(seed))
    Promise.all(positionRequest)
      .then((responses) => (
        airtablePut('preset', {
          positions: [responses[0].id, responses[1].id],
        })
      ))
      .then((response) => { res.json(response) })
  }
}