const core = require("@actions/core");
const fs = require("fs");
const childProcess = require("child_process");

const childProcessOptions = { stdio: "inherit" };

function processServiceAccount(serviceAccount, serviceAccountFile) {
  core.startGroup("Process Service Account");
  try {
    fs.writeFileSync(serviceAccountFile, serviceAccount);
    childProcess.execSync(
      `gcloud auth activate-service-account --key-file ${serviceAccountFile}`,
      childProcessOptions
    );
  } catch (error) {
    core.setFailed(error.message);
    throw new Error(error);
  }

  core.endGroup();
}

function setupGoogleCloudProject(projectId) {
  core.startGroup("Set Google Cloud Project");
  try {
    childProcess.execSync(
      `gcloud config set project ${projectId}`,
      childProcessOptions
    );
  } catch (error) {
    core.setFailed(error.message);
    throw new Error(error);
  }
  core.endGroup();
}

function deployToGoogleCloudAppEngine(currentBranch) {
  core.startGroup("Deploy to Google Cloud App Engine");
  try {
    childProcess.execSync(
      `gcloud app deploy ./app.${
        currentBranch.includes("develop") || currentBranch.includes("release")
          ? "staging"
          : "default"
      }.yaml`,
      childProcessOptions
    );
  } catch (error) {
    core.setFailed(error.message);
    throw new Error(error);
  }
  core.endGroup();
}

function unlinkServiceAccountFile(serviceAccountFile) {
  core.startGroup("Unlink Service Account File");
  try {
    fs.unlinkSync(serviceAccountFile);
  } catch (error) {
    core.setFailed(error.message);
    throw new Error(error);
  }
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
  process.exit(1);
}
