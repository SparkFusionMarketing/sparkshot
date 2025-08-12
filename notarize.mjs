export default async function afterSign(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  // Load only on macOS so Windows builds don’t need the package
  const { notarize } = await import('@electron/notarize');

  const appName = context.packager.appInfo.productFilename;
  console.log('Notarizing', appName);

  await notarize({
    appBundleId: 'com.sparkfusion.sparkshot',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID
  });
}
