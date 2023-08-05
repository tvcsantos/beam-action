[test-badge]: https://github.com/tvcsantos/beam-action/actions/workflows/test.yml/badge.svg

![beam](docs/images/vegeta_beam_text.png)

# B.E.A.M.

![test workflow][test-badge]

> ℹ️ This is a work in progress. Some documentation is still missing. Be tuned for updates! 

## Overview

B.E.A.M. or `beam` for short will enhance your GitHub pull requests with IssueOps capabilities. You will ask `beam` to perform several tasks,
by commenting your pull requests with command-like syntax inputs.

The following tasks are available:
- Deploy to an environment (**in progress**)

### Examples

Below we illustrate examples of commands and expected results.

#### Command `deploy`

> ℹ️ This is still in progress work

## Changelog

All notable changes to this project are documented in [`CHANGELOG.md`](CHANGELOG.md).

## Usage example

### Calling Beam

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
        with:
          app-id: ${{ secrets.GHA_APP_ID }}
          app-private-key: ${{ secrets.GHA_APP_PRIVATE_KEY }}
          app-installation-id: ${{ secrets.GHA_APP_INSTALLATION_ID }}
```

### Handling Deploy

```yaml
name: Deployment

on: deployment

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 🎟 Get GitHub App token
        id: get-app-token
        uses: getsentry/action-github-app-token@v2
        with:
          app_id: ${{ secrets.GHA_APP_ID }}
          private_key: ${{ secrets.GHA_APP_PRIVATE_KEY }}
      - name: start deployment
        uses: bobheadxi/deployments@v1
        id: deployment
        with:
          step: start
          token: ${{ steps.get-app-token.outputs.token }}
          env: ${{ github.event.deployment.environment }}
          deployment_id: ${{ github.event.deployment.id }}
          
      ############ DO YOUR DEPLOY HERE ############
      
      - name: Echo Yeah!
        shell: bash
        # language=bash
        run: echo "yeahhhhh!"

      #############################################
      
      - name: Update deployment status
        uses: bobheadxi/deployments@v1
        if: always()
        with:
          step: finish
          token: ${{ steps.get-app-token.outputs.token }}
          status: ${{ job.status }}
          env: ${{ steps.deployment.outputs.env }}
          deployment_id: ${{ steps.deployment.outputs.deployment_id }}
```

### Inputs

| Input                 | Type    | Required | Default Value | Description                                                                        |
|-----------------------|---------|----------|---------------|------------------------------------------------------------------------------------|
| `bot-name`            | String  | Yes      | `beam`        | The action will react to commands issued for this name.                            |
| `bot-reaction`        | String  | Yes      | `+1`          | The reaction that will be used to mark processed comments.                         |
| `state-branch`        | String  | No       | `beam-state`  | A branch used to keep action state.                                                |
| `ai-enabled`          | Boolean | No       | `false`       | If you want to use AI features. When enabled you need to specify `openai-api-key`. |
| `openai-api-key`      | String  | No       |               | The OpenAI API Key if AI is enabled.                                               |
| `app-id`              | String  | Yes      |               | The bound application identifier.                                                  |
| `app-private-key`     | String  | Yes      |               | The bound application private key.                                                 |
| `app-installation-id` | Integer | Yes      |               | The bound application installation id.                                             |

### Outputs

No outputs available.

## License

The project is released under the [MIT License](LICENSE.md).

## Contributions

Contributions are welcome! See [Contributor's Guide](CONTRIBUTING.md).
