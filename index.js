const core = require('@actions/core');
const github = require('@actions/github');

try {
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = github.context.payload
  const myToken = core.getInput('github_token');
  const octokit = github.getOctokit(myToken)

  getStatusChecks(payload, octokit)

} catch (error) {
  core.setFailed(error.message);
}

async function getStatusChecks(payload, octokit) {
    const { checks } = await octokit.rest.checks.listForRef({
        owner: payload.owner,
        repo: payload.repo,
        ref: payload.pull_request.head.sha,
    });
  
    if (checks.check_runs.length !== 0) {
      console.log(`Detected ${checks.total_count} checks`);
  
      for (const check of checks.check_runs) {
        if (check.app.slug !== 'adoptium-status') {
          console.log(`Creating status check for ${check.name}`);
  
          let checkBuilder = {
            name: check.name,
            status: check.status,
            head_sha: sha,
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

          await octokit.rest.checks.create({
            owner,
            repo,
            checkBuilder
          });
        }
      }
    }
}
