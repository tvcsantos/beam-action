[test-badge]: https://github.com/tvcsantos/beam-action/actions/workflows/test.yml/badge.svg

![beam](docs/images/vegeta_beam_text.png)

# beam

![test workflow][test-badge]

> ℹ️ This is a work in progress. Some documentation is still missing. Be tuned for updates! 

## Overview

`beam` will enhance your GitHub pull requests with IssueOps capabilities. You will ask `beam` to perform several tasks,
by commenting your pull requests with command-like syntax inputs.

The following task are available:
- Deploy to an environment (**in progress**)

### Examples

Below we illustrate examples of commands and expected results.

#### Command `deploy`

> ℹ️ This is still in progress work

## Changelog

All notable changes to this project are documented in [`CHANGELOG.md`](CHANGELOG.md).

## Usage example

```yaml
on:
  issue_comment:
    types: [created]

jobs:
  build:
    name: Beam
    if: ${{ github.event.issue.pull_request }}
    runs-on: ubuntu-latest
    steps:
      - name: Beam at your service!
        uses: tvcsantos/beam-action@v1
```

### Inputs

| Input          | Type   | Required | Default Value         | Description                                                |
|----------------|--------|----------|-----------------------|------------------------------------------------------------|
| `bot-name`     | String | Yes      | `beam`                | The action will react to commands issued for this name.    |
| `bot-reaction` | String | Yes      | `+1`                  | The reaction that will be used to mark processed comments. |
| `token`        | Token  | No       | `${{ github.token }}` | Your GitHub token.                                         |

### Outputs

No outputs available.

## License

The project is released under the [MIT License](LICENSE.md).

## Contributions

Contributions are welcome! See [Contributor's Guide](CONTRIBUTING.md).
