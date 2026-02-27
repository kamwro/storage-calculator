import { bestFit, bestFitDecreasing, firstFit } from './strategies';
import type { ContainerState } from './strategy.types';

describe('calculator strategies', () => {
  const typeMap = new Map([
    [
      'light',
      {
        id: 'light',
        unitWeightKg: 1,
        unitVolumeM3: 0.1,
      },
    ],
    [
      'heavy',
      {
        id: 'heavy',
        unitWeightKg: 10,
        unitVolumeM3: 0.2,
      },
    ],
  ]);

  function makeState(
    overrides?: Partial<ContainerState<{ maxWeightKg: number; maxVolumeM3: number }>>[],
  ): ContainerState<{ maxWeightKg: number; maxVolumeM3: number }>[] {
    const base: ContainerState<{ maxWeightKg: number; maxVolumeM3: number }>[] = [
      {
        container: { maxWeightKg: 50, maxVolumeM3: 1.0 },
        usedW: 0,
        usedV: 0,
        items: new Map(),
      },
      {
        container: { maxWeightKg: 30, maxVolumeM3: 0.6 },
        usedW: 0,
        usedV: 0,
        items: new Map(),
      },
    ];
    if (!overrides) return base;
    return base.map((s, idx) => ({ ...s, ...(overrides[idx] ?? {}) }));
  }

  it('first_fit picks the first container that can accommodate the unit', () => {
    const state = makeState([
      { usedW: 49, usedV: 0.95 }, // cannot fit heavy (weight/volume), cannot fit light (volume)
      { usedW: 0, usedV: 0 }, // can fit
    ]);
    const pickHeavy = firstFit({ state, typeMap, typeId: 'heavy' });
    expect(pickHeavy).toBe(state[1]);
    const pickLight = firstFit({ state, typeMap, typeId: 'light' });
    expect(pickLight).toBe(state[1]);
  });

  it('best_fit picks the container minimizing max remaining ratios (balanced)', () => {
    // Construct a scenario where both containers can fit but scores differ
    const state = makeState([
      { usedW: 10, usedV: 0.5 }, // placing light leads to remW=(50-11)/50=.78, remV=(1.0-0.6)/1.0=.4 => score .78
      { usedW: 20, usedV: 0.0 }, // placing light leads to remW=(30-21)/30=.3, remV=(0.6-0.1)/0.6≈.833 => score .833
    ]);
    const pickLight = bestFit({ state, typeMap, typeId: 'light' });
    expect(pickLight).toBe(state[0]);
  });

  it('best_fit and first_fit return undefined when no container fits', () => {
    const state = makeState([
      { usedW: 50, usedV: 1.0 },
      { usedW: 30, usedV: 0.6 },
    ]);
    expect(firstFit({ state, typeMap, typeId: 'light' })).toBeUndefined();
    expect(bestFit({ state, typeMap, typeId: 'light' })).toBeUndefined();
  });

  it('best_fit_decreasing breaks ties by pre-placement fullness then creation order', () => {
    const state = makeState([
      { container: { maxWeightKg: 10, maxVolumeM3: 1.0 }, usedW: 4, usedV: 0.4 },
      { container: { maxWeightKg: 5, maxVolumeM3: 0.5 }, usedW: 3, usedV: 0.15 },
    ]);
    const pickLight = bestFitDecreasing({ state, typeMap, typeId: 'light' });
    expect(pickLight).toBe(state[0]);
  });
});
