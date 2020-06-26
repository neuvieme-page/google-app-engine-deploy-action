const core = require("@actions/core");
const fs = require("fs");
const childProcess = require("child_process");

const childProcessOptions = { stdio: "inherit", encoding: "utf-8" };

function handleError(childProcess) {
  if (childProcess.error) throw new Error(childProcess.error);
}

function processServiceAccount(serviceAccount, serviceAccountFile) {
  core.startGroup("Process Service Account");
  fs.writeFileSync(serviceAccountFile, serviceAccount);
  handleError(
    childProcess.spawnSync(
      `gcloud auth activate-service-account`,
      ["--key-file", `${serviceAccountFile}`],
      childProcessOptions
    )
  );
  core.endGroup();
}

function setupGoogleCloudProject(projectId) {
  core.startGroup("Set Google Cloud Project");
  handleError(
    childProcess.spawnSync(
      `gcloud config set project`,
      [`${projectId}`],
      childProcessOptions
    )
  );
  core.endGroup();
}

function deployToGoogleCloudAppEngine(currentBranch) {
  core.startGroup("Deploy to Google Cloud App Engine");
  handleError(
    childProcess.spawnSync(
      "gcloud app deploy",
      [
        currentBranch.includes("develop") || currentBranch.includes("release")
          ? "./app.staging.yaml"
          : "./app.default.yaml",
      ],
      childProcessOptions
    )
  );
  core.endGroup();
}

function unlinkServiceAccountFile(serviceAccountFile) {
  core.startGroup("Unlink Service Account File");
  fs.unlinkSync(serviceAccountFile);
  core.endGroup();
}

try {
  const serviceAccountFile = `/tmp/${new Date().getTime()}.json`;
  processServiceAccount(core.getInput("service_account"), serviceAccountFile);
  setupGoogleCloudProject(core.getInput("project_id"));
  deployToGoogleCloudAppEngine(core.getInput("current_branch"));
  unlinkServiceAccountFile(serviceAccountFile);
} catch (error) {
  core.setFailed(error.message);
  process.exit(0);
}
