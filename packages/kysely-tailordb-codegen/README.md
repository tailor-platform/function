# @tailor-platform/function-kysely-tailordb-codegen

Generate [Kysely](https://github.com/kysely-org/kysely) code for TailorDB

## Usage

```sh
npm install -D @tailor-platform/function-kysely-tailordb-codegen
npx kysely-tailordb-codegen -h
```

```
Usage: kysely-tailordb-codegen [options]

Generate Kysely code for TailorDB

Options:
  -a, --app <string>          App name
  -n, --namespace <string>    TailorDB namespace
  -m, --machineuser <string>  Machine user name
  -o, --output <string>       Output file name
  -h, --help                  display help for command
```

## Requirements

This command uses `tailorctl` internally to run the code generation script on the Tailor Platform.
Therefore, please make sure `tailorctl` is installed and the correct workspace is selected before running the command.
