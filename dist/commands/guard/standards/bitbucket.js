"use strict";
import { Flags, SfCommand } from "@salesforce/sf-plugins-core";
import { BitbucketAdapter } from "../../../git-provider-adapters/bitbucket.js";
export default class Bitbucket extends SfCommand {
  static flags = {
    bitbucketToken: Flags.string({
      char: "b",
      required: true
    }),
    workspace: Flags.string({
      char: "w",
      required: true
    }),
    repoSlug: Flags.string({
      char: "r",
      required: true
    }),
    pullRequestId: Flags.string({
      char: "p",
      required: true
    })
  };
  async run() {
    const { flags } = await this.parse(Bitbucket);
    const { bitbucketToken, workspace, repoSlug, pullRequestId } = flags;
    await new BitbucketAdapter({
      token: bitbucketToken,
      workspace,
      repoSlug
    }).sendPrReview("test", pullRequestId);
  }
}
