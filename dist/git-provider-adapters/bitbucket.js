"use strict";
export class BitbucketAdapter {
  #token;
  #workspace;
  #repoSlug;
  constructor(config) {
    this.#token = config.token;
    this.#workspace = config.workspace;
    this.#repoSlug = config.repoSlug;
  }
  async sendPrReview(review, prId) {
    const url = `https://api.bitbucket.org/2.0/repositories/${this.#workspace}/${this.#repoSlug}/pullrequests/${prId}/comments`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.#token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: { raw: review } })
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Bitbucket API Error: ${res.status} - ${errorText}`);
    }
  }
  async fetchGuardRulesFromPr(prId) {
    const filesUrl = `https://api.bitbucket.org/2.0/repositories/${this.#workspace}/${this.#repoSlug}/pullrequests/${prId}/diffstat`;
    const filesRes = await fetch(filesUrl, {
      headers: {
        Authorization: `Bearer ${this.#token}`,
        "Content-Type": "application/json"
      }
    });
    if (!filesRes.ok) {
      const errorText = await filesRes.text();
      throw new Error(`Bitbucket API Error: ${filesRes.status} - ${errorText}`);
    }
    const files = await filesRes.json();
    const guardYmlFiles = files.values.map((file) => file.path).filter(
      (path) => path.startsWith(".guard/") && path.endsWith(".yml")
    );
    const fileContents = await Promise.all(
      guardYmlFiles.map(async (filePath) => {
        const contentUrl = `https://api.bitbucket.org/2.0/repositories/${this.#workspace}/${this.#repoSlug}/src/${prId}/${filePath}`;
        const contentRes = await fetch(contentUrl, {
          headers: {
            Authorization: `Bearer ${this.#token}`,
            "Content-Type": "application/json"
          }
        });
        if (!contentRes.ok) {
          console.warn(`Failed to fetch ${filePath}: ${contentRes.status}`);
          return null;
        }
        return await contentRes.text();
      })
    );
    return fileContents.filter(
      (content) => content !== null
    );
  }
}
