import { airtablePut } from '../lib/airtable'

const addToPositions = (seed) : Promise<PositionResponse> => airtablePut('position', seed)

interface PositionResponse {
    id: string
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const positionRequest : Array<PositionResponse> = JSON.parse(req.body).seeds.map((seed) => addToPositions(seed))

    const positionResponse = await Promise.all(positionRequest)
    const presetResponse = await airtablePut('preset', {
      positions: positionResponse.map((r) => r.id)
    })

    res.json(presetResponse)
  }
}
