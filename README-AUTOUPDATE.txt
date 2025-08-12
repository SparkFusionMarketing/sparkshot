Auto updates and signing

What this adds
- Auto update checks with electron-updater
- Check Updates button in the app
- Publish to GitHub Releases on tag push
- Windows signing support via electron-builder
- Mac notarization stays as before

Steps
1) Create a GitHub repo for SparkShot
2) Edit package.json build.publish with your owner and repo
3) Add GH_TOKEN to your env or GitHub Actions secrets
4) Optional Windows signing: add WIN_CSC_LINK and WIN_CSC_KEY_PASSWORD
5) Tag a release like v1.2.0 and push
6) The workflow builds and uploads to Releases and your app will auto update

Local publish
- Set GH_TOKEN in your shell
- Run npm run build
- electron-builder uploads to the GitHub release
