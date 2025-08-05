"use strict";
import { Flags, SfCommand } from "@salesforce/sf-plugins-core";
import { GithubProvider } from "../../../git-provider-adapters/github.js";
export default class Github extends SfCommand {
  static flags = {
    githubToken: Flags.string({
      char: "g",
      required: true
    }),
    repo: Flags.string({
      char: "r",
      required: true
    }),
    pr: Flags.string({
      char: "p",
      required: true
    })
  };
  async run() {
    const { flags } = await this.parse(Github);
    const { githubToken, repo, pr } = flags;
    const provider = new GithubProvider({
      repo,
      token: githubToken
    });
    const rules = await provider.fetchGuardRulesFromPr(pr);
    await new GithubProvider({
      repo,
      token: githubToken
    }).sendPrReview(rules[0], pr);
  }
}
