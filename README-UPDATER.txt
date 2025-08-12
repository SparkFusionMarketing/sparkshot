SparkShot Updater – Quick Setup

1) Replace package.json with this one.
   - Update "build.publish.owner" to your GitHub username.
   - Optionally change "repo" from "sparkshot" to your repo name.

2) Create a public GitHub repo and push your code.

3) Set your GitHub token (repo scope) so electron-builder can publish:
   Windows CMD:
     setx GH_TOKEN YOUR_PERSONAL_ACCESS_TOKEN
   Then close and reopen Command Prompt.

4) Publish a signed or unsigned Windows release:
   - Bump the version in package.json (must increase every release).
   - Run:
       rmdir /s /q dist
       npm run release:win
   - This builds and uploads a Release with:
       SparkShot Setup x.y.z.exe
       latest.yml
       (and blockmap files)

5) Test auto-update:
   - Install the EXE from your GitHub Release.
   - Bump version again in package.json.
   - Run: npm run release:win
   - Open the installed app, click “Check Updates”.
     You should see "Update available" / "Update ready" and be prompted to install on quit.

Troubleshooting
- 404 latest.yml: The release must be published (not draft). The -p always flag does this.
- Nothing happens: Ensure version increased.
- Private repo: Use a public repo for easiest setup.
- Mac updates require signing + notarization; Windows works without a cert but signing is recommended for fewer warnings.
