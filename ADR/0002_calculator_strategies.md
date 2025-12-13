# 0002_calculator_strategies — first_fit and best_fit

Date: 2025-12-13
Status: Accepted

Context
I need an allocation calculator that respects both weight and volume, is easy to reason about in a demo, and is fast enough for a small portfolio app.

Decision
I implement two strategies:
- first_fit: I place each unit into the first container that has enough weight and volume headroom.
- best_fit: for each unit, I pick the container that minimizes the maximum of remaining capacity ratios (weight, volume) after placement — this packs tighter across both constraints.

I also cap input at 100 items and 100 containers per request to keep the demo responsive and predictable.

Why
- first_fit is simple and deterministic; it communicates the core constraints clearly.
- best_fit gives a better packing heuristic without over‑engineering exact bin packing.

Consequences
- These are heuristics; they won’t always find the optimal packing.
- The 100/100 cap is a guardrail for the demo environment.
