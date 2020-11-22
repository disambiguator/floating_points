import { airtablePut } from '../lib/airtable';
import { Seed } from '../components/spiro';
import { NowRequest, NowResponse } from '@vercel/node';

const addToPositions = (seed: Seed): Promise<PositionResponse> =>
  airtablePut('position', seed);

interface PositionResponse {
  id: string;
}

interface RequestBody {
  seeds: Seed[];
}

module.exports = async (req: NowRequest, res: NowResponse) => {
  if (req.method === 'POST') {
    const { seeds } = JSON.parse(req.body) as RequestBody;
    const positionRequest: Array<
      Promise<PositionResponse>
    > = seeds.map((seed) => addToPositions(seed));

    const positionResponse = await Promise.all(positionRequest);
    const presetResponse = await airtablePut('preset', {
      positions: positionResponse.map((r) => r.id),
    });

    res.json(presetResponse);
  }
};
