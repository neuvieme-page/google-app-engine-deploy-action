# google-app-engine-deploy-action
Github Action to deploy on Google App Engine

## Usage

1. Create an `main.yml` file in `./github/workflows` folder in your NuxtJS Project and put the following code inside.
```yaml
on:
  push:
    branches:
      - master
      - develop
      - 'release/**'

jobs:
  deploy:
    name: Deploy on Google Cloud App Engine
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: actions/setup-node@v1
        with:
          node-version: '12.x'
      - name: Cache Dependencies
        uses: actions/cache@v2
        with:
          path: |
            **/node_modules
          key: ${{ runner.os }}-${{ hashFiles('**/lockfiles') }}
      - name: 'Install dependencies'
        run: npm install
      - name: 'Build Project'
        run: npm run build
      - name: Deploy Project
        uses: neuvieme-page/google-app-engine-deploy-action@master
        with:
          service_account: ${{ secrets.SERVICE_ACCOUNT }}
          project_id: ${{ secrets.PROJECT_ID }}
          current_branch: ${{ github.ref }}
```
2. In your Google Cloud Project, create and activate a service account: See: https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances

3. Copy the service account key file to your repository secrets as `SERVICE_ACCOUNT` and project id as `PROJECT_ID`.