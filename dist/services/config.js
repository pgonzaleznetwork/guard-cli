"use strict";
import { ConfigFile } from "@salesforce/core";
class GuardConfig {
  config;
  async #createConfig() {
    this.config ??= await ConfigFile.create({
      filename: "autorabit-guard-config.json",
      isGlobal: true
    });
    return this.config;
  }
  async getConfig() {
    const config = await this.#createConfig();
    return {
      apiToken: config.get("apiToken")
    };
  }
  async setApiToken(value) {
    const config = await this.#createConfig();
    config.set("apiToken", value);
    await config.write();
  }
}
export const guardConfig = new GuardConfig();
