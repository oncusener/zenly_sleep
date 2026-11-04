const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Pod hedeflerinin tamamini en az verilen iOS surumune ceker.
 *
 * Neden gerekiyor: Xcode 26+ 15.0 altindaki deployment target'lari reddediyor
 * ("the range of supported deployment target versions is 15.0 to 27.0.x").
 * Podfile'in `platform :ios` satirini yukseltmek — yani expo-build-properties
 * icindeki ios.deploymentTarget — yetmiyor, cunku bazi pod'lar kendi resource
 * bundle hedeflerinde dusuk degeri tasiyor ve pod install o degeri koruyor.
 * Bu projede takilanlar: GoogleMobileAdsResources, UserMessagingPlatformResources
 * ve ReachabilitySwift (12.0), RNCAsyncStorage_resources (13.4).
 *
 * ios/ klasoru prebuild ile yeniden uretildigi icin Podfile'i elle duzenlemek
 * kalici olmuyor; duzeltme bu yuzden bir config plugin olarak duruyor.
 */
const withPodMinDeploymentTarget = (config, { deploymentTarget } = {}) => {
    const target = deploymentTarget ?? '15.1';

    return withDangerousMod(config, [
        'ios',
        (cfg) => {
            const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
            let contents = fs.readFileSync(podfilePath, 'utf8');

            const marker = '# withPodMinDeploymentTarget';
            if (contents.includes(marker)) return cfg;

            const anchor = '  post_install do |installer|\n';
            if (!contents.includes(anchor)) {
                throw new Error(
                    '[withPodMinDeploymentTarget] Podfile icinde post_install blogu bulunamadi; ' +
                        'Expo sablonu degismis olabilir, plugin guncellenmeli.'
                );
            }

            const injection =
                anchor +
                `    ${marker}: Xcode 26+ 15.0 altini kabul etmiyor.\n` +
                `    installer.pods_project.targets.each do |t|\n` +
                `      t.build_configurations.each do |bc|\n` +
                `        current = bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET']\n` +
                `        if current.nil? || current.to_f < ${parseFloat(target)}\n` +
                `          bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${target}'\n` +
                `        end\n` +
                `      end\n` +
                `    end\n`;

            contents = contents.replace(anchor, injection);
            fs.writeFileSync(podfilePath, contents);
            return cfg;
        },
    ]);
};

module.exports = withPodMinDeploymentTarget;
