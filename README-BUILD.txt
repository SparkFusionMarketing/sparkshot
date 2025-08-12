SparkShot — Installers for Windows and Mac

Build
- npm run install:deps
- npm run build

Windows
- Output: dist/SparkShot Setup x.y.z.exe
- To sign, set env:
  WIN_CSC_LINK=path or base64 to your .pfx
  WIN_CSC_KEY_PASSWORD=your password

Mac
- Icons: mac-icons/SparkShot.icns
  If SparkShot.icns is missing, create it on a Mac:
    iconutil -c icns mac-icons/SparkShot.iconset -o mac-icons/SparkShot.icns
- Notarization env vars before build:
  APPLE_ID
  APPLE_APP_SPECIFIC_PASSWORD
  APPLE_TEAM_ID
- Output: dist/SparkShot-x.y.z.dmg and .zip
