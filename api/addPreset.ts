import { airtablePut } from '../lib/airtable'
import { Seed } from "../pages/spiro";
import { NowRequest, NowResponse } from '@now/node';

const addToPositions = (seed: Seed) : Promise<PositionResponse> => airtablePut('position', seed)

interface PositionResponse {
    id: string
}

module.exports = async (req: NowRequest, res: NowResponse) => {
  if (req.method === 'POST') {
    const seeds: Array<Seed> = JSON.parse(req.body).seeds
    const positionRequest : Array<Promise<PositionResponse>> = seeds.map((seed) => addToPositions(seed))

    const positionResponse = await Promise.all(positionRequest)
    const presetResponse = await airtablePut('preset', {
      positions: positionResponse.map((r) => r.id)
    })

    res.json(presetResponse)
  }
}
