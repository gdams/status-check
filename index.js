const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
    // Get the JSON webhook payload for the event that triggered the workflow
    const token = core.getInput('github_token');
    const octokit = github.getOctokit(token);
    const payload = github.context.payload

    const owner = payload.pull_request.head.repo.owner.login;
    const repo = payload.pull_request.head.repo.name;
    const ref = payload.pull_request.head.ref;

    core.debug(owner, repo, ref)

    const checks = await octokit.rest.checks.listForRef({
        owner: owner,
        repo: repo,
        ref: ref,
    });

    core.debug(checks)

    getStatusChecks(github.context.payload, octokit);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
