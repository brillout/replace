# `@brillout/replace`


## Global installation

```shell
pnpm add -g @brillout/replace
```

You can now run the CLI (`$ replace`) and API (`import { replace } from '@brillout/replace'`) anywhere.


## CLI

> [!NOTE]
> For strings with complex shell escaping, we recommend using [the API](#API) instead.


Replace `oldString` with `newString`:
```shell
replace oldString newString
```

Replace `old string` with `new string`:
```shell
replace "old string" "new string"
```

Replace `old "string"` with `new "string"`:
```shell
replace "old \"string\"" "new \"string\""
```

Show help:
```shell
replace --help
```


## API

```js
import { replace } from '@brillout/replace'
replace('\!foo', '\!bar')
```
