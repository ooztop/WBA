// Telefonun kendi özellikleri: panoya kopyalama, paylaşım menüsü, arama / harita / WhatsApp
import { Linking, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { toast } from './store';

export const copy = (text: string, msg: string) => { Clipboard.setStringAsync(text).catch(() => {}); toast(msg); };
export const openUrl = (url: string, msg: string) => { toast(msg); if (Platform.OS !== 'web') Linking.openURL(url).catch(() => {}); };
export const share = (message: string) => {
  if (Platform.OS === 'web') { toast('Paylaşım menüsü'); return; }
  Share.share({ message }).catch(() => {});
};
export const LINK = 'https://pro.app/denizarslan';
