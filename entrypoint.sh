#!/bin/sh
# exit when any command fails
set -e

# keep track of the last executed command
# trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG

# echo an error message before exiting
# trap 'echo "\"${last_command}\" command filed with exit code $?."' EXIT

SERVICE_ACCOUNT=$1
PROJECT_ID=$2
CURRENT_BRANCH=$3
echo $SERVICE_ACCOUNT > /tmp/service_account.json
gcloud auth activate-service-account --key-file=/tmp/service_account.json
gcloud config set project $PROJECT_ID

if [$CURRENT_BRANCH = 'master']
then
  gcloud app deploy ./app.default.yaml
else
  gcloud app deploy ./app.staging.yaml
fi
