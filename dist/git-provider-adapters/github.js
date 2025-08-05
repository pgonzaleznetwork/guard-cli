"use strict";
const UserAgent = "autorabit-cli";
export class GithubProvider {
  #repo;
  #token;
  constructor(config) {
    this.#token = config.token;
    this.#repo = config.repo;
  }
  async sendPrReview(review, prNumber) {
    const url = `https://api.github.com/repos/${this.#repo}/issues/${prNumber}/comments`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${this.#token}`,
        "Content-Type": "application/json",
        "User-Agent": UserAgent
      },
      body: JSON.stringify({ body: review })
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`GitHub API Error: ${res.status} - ${errorText}`);
    }
  }
  async fetchGuardRulesFromPr(prNumber) {
    const prUrl = `https://api.github.com/repos/${this.#repo}/pulls/${prNumber}`;
    const prRes = await fetch(prUrl, {
      headers: {
        Authorization: `token ${this.#token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": UserAgent
      }
    });
    if (!prRes.ok) {
      const errorText = await prRes.text();
      throw new Error(`GitHub API Error: ${prRes.status} - ${errorText}`);
    }
    const prData = await prRes.json();
    const filesUrl = `https://api.github.com/repos/${this.#repo}/pulls/${prNumber}/files`;
    const filesRes = await fetch(filesUrl, {
      headers: {
        Authorization: `token ${this.#token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": UserAgent
      }
    });
    if (!filesRes.ok) {
      const errorText = await filesRes.text();
      throw new Error(`GitHub API Error: ${filesRes.status} - ${errorText}`);
    }
    const files = await filesRes.json();
    const guardYmlFiles = files.map((file) => file.filename).filter(
      (filename) => filename.startsWith(".guard/") && filename.endsWith(".yml")
    );
    const sha = prData.head.sha;
    const fileContents = await Promise.all(
      guardYmlFiles.map(async (filename) => {
        const contentUrl = `https://api.github.com/repos/${this.#repo}/contents/${filename}?ref=${sha}`;
        const contentRes = await fetch(contentUrl, {
          headers: {
            Authorization: `token ${this.#token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": UserAgent
          }
        });
        if (!contentRes.ok) {
          console.warn(`Failed to fetch ${filename}: ${contentRes.status}`);
          return null;
        }
        const contentData = await contentRes.json();
        return Buffer.from(contentData.content, "base64").toString(
          "utf-8"
        );
      })
    );
    return fileContents.filter(
      (content) => content !== null
    );
  }
}
