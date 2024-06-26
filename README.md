### Before running, please install the following:
Expo and Expo Router:
```
npx install-expo-modules@latest
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npm i react-native-svg@15.2.0 expo-router@3.5.14 expo@51.0.9 expo-constants@16.0.2
```
The latter ones are recommended when running expo.


## How to run:
### For web
In terminal, under the project folder:
```
npm run web
```

### For iOS/Android
Please install Expo Go first ( [iOS](https://apps.apple.com/us/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en&gl=US&pli=1) )<br>
Once `npm run web` is done, a QR code will appear on your terminal. Use (Expo Go on Android/Camera on iOS) to scan the QR code. Alternatively, especially if the phone is not connecting, do `npx expo start -c --tunnel`, then scan. You can also open in web form by pressing `w` in that terminal.
