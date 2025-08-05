"use strict";
import { Flags, SfCommand } from "@salesforce/sf-plugins-core";
import { guardConfig } from "../../services/config.js";
export default class Auth extends SfCommand {
  static flags = {
    apiToken: Flags.string({
      char: "a",
      required: true
    })
  };
  async run() {
    const { flags } = await this.parse(Auth);
    await guardConfig.setApiToken(flags.apiToken);
  }
}
