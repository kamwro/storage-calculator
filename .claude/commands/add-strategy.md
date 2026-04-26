Add a new bin-packing strategy named `$ARGUMENTS` to the storage-calculator.

A strategy is a pure function `StrategyFn<ContainerEntity>` that selects which container to place a single unit into. Adding one touches 5 files. Work through them in order:

---

**Step 1 — Read existing code first**

Read these files to understand the patterns before writing anything:

- `backend/src/calculator/strategy.types.ts` — `StrategyFn<C>`, `ContainerState<C>`, `ItemTypeLike`
- `backend/src/calculator/strategies.ts` — all existing functions + `strategyMap`
- `backend/src/calculator/calculator.service.ts` — note that `single_container_only` is a special case handled outside `strategyMap`; all other strategies go through `strategyMap`

---

**Step 2 — Implement the strategy function**

In `backend/src/calculator/strategies.ts`:

- Export a new `const $ARGUMENTS: StrategyFn<{ maxWeightKg: number; maxVolumeM3: number }> = ({ state, typeMap, typeId }) => { ... }`
- Follow the pattern of `firstFit` / `bestFit`: guard with `if (!t) return undefined`, iterate `state`, check weight + volume constraints, return a `ContainerState` or `undefined`
- Add `$ARGUMENTS` to `strategyMap` at the bottom

---

**Step 3 — Update backend DTO**

In `backend/src/calculator/dto/evaluate.dto.ts`:

- Add `'$ARGUMENTS'` to the `@IsIn([...])` array
- Add `| '$ARGUMENTS'` to the `strategy` union type

---

**Step 4 — Update backend strategy type**

In `backend/src/calculator/strategy.types.ts`:

- Add `| '$ARGUMENTS'` to the `StrategyKey` type

---

**Step 5 — Update frontend types**

In `frontend/src/types.ts`:

- Add `| '$ARGUMENTS'` to the `PackingStrategy` type

---

**Step 6 — Add to UI**

In `frontend/src/components/CalculatorPanel.tsx`:

- Add `<option value="$ARGUMENTS">$ARGUMENTS</option>` inside the strategy `<select>` (around line 140–143)

---

**Step 7 — Verify**

Run from the repo root:

```
pnpm run lint:all && pnpm run build:all
```

Fix any TypeScript or lint errors before declaring done. If lint or build fails, do not stop — diagnose and fix.

---

**Notes**

- Strategy keys use snake_case (e.g. `worst_fit`, `next_fit`)
- `bfd` is an alias for `best_fit_decreasing` in `strategyMap` — aliases are fine to add the same way
- Do NOT modify existing migration files or entity fields; strategies are purely algorithmic
- E2E specs in `e2e/api/` assert the strategy union — if you add to `EvaluateRequestDto`, the E2E tests will still pass (they don't test all possible values exhaustively)
