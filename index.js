const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const token = core.getInput('github_token');
        const octokit = github.getOctokit(token);
        const payload = github.context.payload

        const owner = payload.pull_request.head.repo.owner.login;
        const repo = payload.pull_request.head.repo.name;
        const ref = payload.pull_request.head.sha;

        core.info(`inputs: ${owner} ${repo} ${ref}`)

        const checks = await octokit.rest.checks.listForRef({
            owner: owner,
            repo: repo,
            ref: ref,
        });

        if (checks.data.total_count !== 0) {
            core.info(`Detected ${checks.data.total_count} checks`);

            for (const check of checks.data.check_runs) {
                core.info(`Creating status check for ${check.name}`);

                let checkBuilder = {
                    repo: repo,
                    owner: owner,
                    name: check.name,
                    status: check.status,
                    head_sha: ref,
                    started_at: check.started_at
                }
            
                if (check.status === 'completed') {
                    checkBuilder.completed_at = check.completed_at;
                }
            
                if (check.external_id) {
                    checkBuilder.external_id = check.external_id;
                }
            
                if (check.conclusion) {
                    checkBuilder.conclusion = check.conclusion;
                }
            
                if (check.output && check.output.title) {
                    let output = {}
                    if (check.output.title) {
                        output.title = check.output.title;
                    }
            
                    if (check.output.summary) {
                        output.summary = check.output.summary;
                    }
                    checkBuilder.output = output;
                }
            
                if (check.details_url) {
                    checkBuilder.details_url = check.details_url;
                }

                await octokit.rest.checks.create(checkBuilder);
            }
        }

        core.info(JSON.stringify(checks))
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
