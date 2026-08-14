/**
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AppRegistry, I18nManager } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

I18nManager.allowRTL(true);
I18nManager.swapLeftAndRightInRTL(true);

AppRegistry.registerComponent(appName, () => App);
