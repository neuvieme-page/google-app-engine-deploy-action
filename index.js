const core = require("@actions/core");
const fs = require("fs");
const childProcess = require("child_process");

const childProcessOptions = { stdio: "inherit" };

function processServiceAccount(serviceAccount, serviceAccountFile) {
  core.startGroup("Process Service Account");
  fs.writeFileSync(serviceAccountFile, serviceAccount);
  childProcess.execSync(
    `gcloud auth activate-service-account --key-file ${serviceAccountFile}`,
    childProcessOptions
  );
  core.endGroup();
}

function setupGoogleCloudProject(projectId) {
  core.startGroup("Set Google Cloud Project");
  childProcess.execSync(
    `gcloud config set project ${projectId}`,
    childProcessOptions
  );
  core.endGroup();
}

function deployToGoogleCloudAppEngine(currentBranch) {
  core.startGroup("Deploy to Google Cloud App Engine");
  childProcess.execSync(`npm run build && gcloud app deploy`, childProcessOptions);
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
  deployToGoogleCloudAppEngine();
  unlinkServiceAccountFile(serviceAccountFile);
} catch (error) {
  core.setFailed(error.message);
  process.exit(0);
}
