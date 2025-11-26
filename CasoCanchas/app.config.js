module.exports = {
  expo: {
    name: "CasoCanchas",
    slug: "CasoCanchas",
    scheme: "casocanchas",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mrcasuela.CasoCanchas",
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.mrcasuela.CasoCanchas",
      googleServicesFile: "./google-services.json",
      usesCleartextTraffic: true,
      config: {
        googleMobileAdsAppId: "ca-app-pub-3940256099942544~3347511713" // Test ID
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "63e9686a-e140-440c-9c42-d617b5fe8383"
      }
    },
    plugins: [
      "expo-web-browser",
      "@react-native-google-signin/google-signin",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
            networkSecurityConfig: "./android-network-security-config.xml"
          }
        }
      ]
    ]
  }
};
