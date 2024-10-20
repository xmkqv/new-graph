# qx

-   > Do not solve hard problems.
-   > Complexity from simplicity.
-   > Done > Perfect > and > Excellent > Quick.
-   > Space constraint (few options) → success.
-   > Art is for enjoying and burning.

# overview

-   **simple**
-   **scalable**
    -   100,000 nodes + edges
-   **for customers**
    -   auth protected
    -   isolated & shared storage
-   **general + extendable**
    -   core (flux + qx)
    -   apps (guide, dashboard, plotting, prompt patterns)
-   **multi-interface**
    -   mobile
    -   desktop
    -   messaging
-   **qx**
    -   hierarchical
    -   generative

# flows

## make

::: tip

-   write out the ð
-   estimate the time
-   execute for time
-   review the ð
-   iterate

:::

::: warning

```bash
qx new_code --path <filepath> <tests-dir>
```

-   copy paste / update paths

:::

## test driven development

-   [vitest](https://vitest.dev/guide/)
    -   [vscode](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)
    -   `"vitest.workspaceConfig": "${workspaceFolder}/flux/vite.config.js",`

# glossary

-   **side effect**: modified state outside of function scope
-   **pure function**: does not have side effects
-   **derived signals**: const x = () => ...
-   **prop drilling**: passing props through multiple components

## stack

-   **package manager**: bun
-   **framework**: solidjs / typescript
-   **build**: vite
-   **server**: fastapi / vite
-   **styling**: tailwind
-   **testing**: vitest
-   **db**: ???
-   **dev db**: ???
-   **auth**: ??? (surrealdb)
-   **website**: godaddy
    -   **???**: squarespace
-   **server**: fly io
-   **front**:
    -   **animations**: [motion one](https://motion.dev/)
    -   **icons**: [solid icons](https://github.com/x64Bits/solid-icons)

## .env

-   [bun env](https://bun.sh/docs/runtime/env)

## tests

## server

-   [serve from fastapi](https://stackoverflow.com/questions/65419794/serve-static-files-from-root-in-fastapi)

## user stories

-   [dashboard](https://hackmd.io/8L1R0CFKShmunAr3UeVMVQ)

## commands

### install

```bash
# eslint
bun install --save-dev eslint @eslint/js @types/eslint__js typescript typescript-eslint
bun install --save-dev eslint-plugin-simple-import-sort eslint-plugin-unused-imports eslint-plugin-import vite-plugin-eslint
# testing
bun install --save-dev vitest
# client generation
bun install --save-dev @hey-api/openapi-ts @hey-api/client-axios @hey-api/client-fetch
# helpers
bun install tiny-invariant
# icons
bun install solid-icons
# markdown editor
bun install easymde dompurify
# features
bun install tippy.js solid-motionone ag-grid-community
```

## packages

-   [awesome-solid-js](https://github.com/one-aalam/awesome-solid-js)
    -   [transitions](https://github.com/solidjs-community/solid-transition-group)
-   [particles](https://github.com/tsparticles/solid?tab=readme-ov-file)
-   charts
    -   [apexcharts](https://github.com/wobsoriano/solid-apexcharts?tab=readme-ov-file)
-   markdown
    -   [easymde](???)
-   graphs - [pykeen](https://github.com/pykeen/pykeen)
-   ascii
    -   [asciimatics](https://github.com/peterbrittain/asciimatics)
-   prompts
    -   [promptfoo](https://github.com/promptfoo/promptfoo)
    -   [awesome-prompts](https://github.com/promptslab/Awesome-Prompt-Engineering)
-   local llm
    -   [torchchat](???)
    -   browser
        -   [web-llm](???)
-   javascript
    -   tables
        -   [ag-grid](https://github.com/ag-grid/ag-grid)
        -   ~~[papaparse](https://www.papaparse.com/)~~

## ux

| action | flux                           | atom   |
| ------ | ------------------------------ | ------ |
| flick  | open thread                    |        |
| drag   | move                           |        |
| click  | open/close: input, main thread | select |
|        |                                |        |

## Content Hashing

The SimHash method (also called Charikar’s hash) allows for near-duplicate
detection. It implements a locality-sensitive hashing method based on a rolling
hash and comparisons using the hamming distance. Overall it is reasonably fast
and accurate for web texts and can be used to detect near duplicates by fixing a
similarity threshold.

-   create a Simhash for near-duplicate detection

```python
from trafilatura.hashing import Simhash first = Simhash("This is a
text.") second = Simhash("This is a test.") second.similarity(first)
0.84375
```

-   use existing Simhash

```python
first_copy = Simhash(existing_hash=first.hash)
first_copy.similarity(first) 1.0
```
