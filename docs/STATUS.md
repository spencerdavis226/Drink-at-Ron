# Current status

## Release-ready baseline

- The shared painted continuous card frame is approved.
- Latest verified baseline: 72 unit passes; build and offline budgets pass; 40 browser passes, 3 failures, 3 skips; and 4 workshop passes.
- Saved sessions use schema v2 migration while retaining the existing storage key.

## WIP, not release-ready

- Dice work is preserved in checkpoint `489d0aa` (`chore: checkpoint dice WIP`). It is not approved for release.
- Dice exists in workshop fixtures, not the production Core.
- The outstanding card request is smaller cards with the fixed original 2:3 geometry.
- Known issue: Safari flattens the dice presentation.

## Next task

Review the preserved dice WIP against the approved frame and resolve the Safari dice flattening before considering any production promotion.
