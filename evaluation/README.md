# Product Evaluation Validation Harness

This directory contains a deterministic, data-first validation harness for the product evaluation system.

## Goals

The harness tests the evaluation rules before they are trusted in production:

- identical products must not be confused with variants
- comparison is limited to the same detailed category
- missing data is not treated as zero quality
- review count changes confidence rather than product quality by itself
- manufacturer claims and independent measurements remain separate
- incompatible test methods are not blindly averaged
- price/value is separated from quality
- uncertainty can prevent false winner declarations
- Pareto-nondominated products are not forced into a fake single winner
- small perturbations should not cause unjustified rank flips
- malformed category assignments are rejected by safety rules

## Run

```bash
node evaluation/validate.js
```

The command exits with status 0 only when every invariant and adversarial scenario passes.

## Design rule

The harness is deliberately conservative. A test that cannot establish a defensible winner should return `INSUFFICIENT_EVIDENCE`, `TIE`, or `TRADEOFF` rather than invent certainty.
