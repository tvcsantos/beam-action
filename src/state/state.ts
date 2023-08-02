import {GitError, ResetMode, SimpleGit} from 'simple-git'
import * as core from '@actions/core'

export class State {
  private readonly git: SimpleGit
  private readonly branch: string
  private readonly localFolder: string

  constructor(git: SimpleGit, branch: string) {
    this.git = git
    this.branch = branch
    this.localFolder = `.${this.branch}/`
  }

  private async checkStateIgnore(): Promise<boolean> {
    core.debug(`Checking if ${this.branch} is present in .gitignore`)

    const strings = await this.git.checkIgnore(this.localFolder)

    return strings.includes(this.localFolder)
  }

  private async checkStateBranchExists(): Promise<boolean> {
    core.debug(`Checking if ${this.branch} exists in remote`)

    try {
      const result = await this.git.fetch('origin', this.branch)
      core.info(JSON.stringify(result))
    } catch (error) {
      if (error instanceof GitError) {
        core.warning(error)
      } else {
        throw error
      }
      return false
    }

    return true
  }

  async hydrate(): Promise<void> {
    const isStateIgnored = await this.checkStateIgnore()

    if (!isStateIgnored) {
      throw new Error(
        `Please make sure ${this.localFolder} is present in .gitignore`
      )
    }

    const stateBranchExists = await this.checkStateBranchExists()

    if (stateBranchExists) {
      core.debug(`${this.branch} branch already exists`)
      await this.addWorktree()
    } else {
      core.debug(`${this.branch} branch does not exist yet`)
      await this.createBranch()
    }

    return Promise.resolve(undefined)
  }

  private async createBranch(): Promise<void> {
    core.debug(`Creating ${this.branch} branch and adding to worktree`)
    await this.git.raw('worktree', 'add', '--detach', this.localFolder)
    await this.git
      .cwd({path: this.localFolder, root: false})
      .checkout(['--orphan', this.branch])
      .reset(ResetMode.HARD)
  }

  private async addWorktree(): Promise<void> {
    core.debug(`Adding ${this.branch} branch to worktree`)
    await this.git.raw(
      'worktree',
      'add',
      '-b',
      this.branch,
      `./.${this.branch}`,
      `origin/${this.branch}`
    )
  }

  private async push(): Promise<void> {
    core.debug(`Pushing updates to ${this.branch} branch`)

    await this.git
      .cwd({path: this.localFolder, root: false})
      .push(['origin', this.branch])
  }

  private async commit(): Promise<void> {
    core.debug(`Committing updates to ${this.branch} branch`)

    await this.git.cwd({path: this.localFolder, root: false}).add('.')

    await this.git
      .addConfig('user.name', 'github-actions[bot]')
      .addConfig('user.email', 'github-actions[bot]@users.noreply.github.com')
      .cwd({path: this.localFolder, root: false})
      .commit(`${this.branch} update`)
  }

  private async cleanup(): Promise<void> {
    core.debug(`Cleaning action ${this.branch} branch`)
    await this.git.raw('worktree', 'remove', `.${this.branch}`)
    await this.git.deleteLocalBranch(this.branch, true)
  }

  async persist(): Promise<void> {
    try {
      await this.commit()
      await this.push()
    } finally {
      await this.cleanup()
    }
  }
}
