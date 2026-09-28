import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BellIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Badge,
  Button,
  IconButton,
  LessonRow,
  ScreenHeader,
  SectionHeader,
  TabBar,
  Text,
  WeekStrip,
  type Day,
  type TabKey,
} from './components';
import { colors, palette, radius, size, spacing, type TypographyVariant } from './theme';

const swatches: { name: string; value: string; use: string }[] = [
  { name: 'Mürekkep', value: palette.ink, use: 'Metin, birincil buton, dolu takvim bloğu' },
  { name: 'Açık mavi', value: palette.blue, use: 'Müsait saat, onaylı rezervasyon, bilgi dolgusu' },
  { name: 'Açık kırmızı', value: palette.red, use: 'Ödenmemiş, iptal, dikkat' },
  { name: 'Beyaz', value: palette.white, use: 'Ekran zemini' },
  { name: 'Gri 100', value: palette.gray100, use: 'Satır ve gün dolgusu, pasif dolgu' },
  { name: 'Gri 600', value: palette.gray600, use: 'İkincil metin, pasif ikon' },
];

const typeSamples: { variant: TypographyVariant; spec: string; sample: string }[] = [
  { variant: 'screenTitle', spec: 'ekran-başlık · 800/26', sample: 'Eylül 2026' },
  { variant: 'sectionTitle', spec: 'bölüm-başlık · 800/17', sample: 'Bugünün dersleri' },
  { variant: 'rowTitle', spec: 'satır-başlık · 700/14.5', sample: 'Elif Yıldırım' },
  { variant: 'body', spec: 'gövde · 500/13.5', sample: 'Rezervasyon en geç ders saatinden 12 saat önce yapılabilir.' },
  { variant: 'caption', spec: 'yardımcı · 500/12', sample: '8 – 14 Eylül · 3 ders' },
];

const week: Day[] = [
  { key: '8', label: 'PZT', date: 8 },
  { key: '9', label: 'SAL', date: 9, marked: true },
  { key: '10', label: 'ÇAR', date: 10 },
  { key: '11', label: 'PER', date: 11 },
  { key: '12', label: 'CUM', date: 12, marked: true },
  { key: '13', label: 'CMT', date: 13 },
];

/** Tasarım sistemi kataloğu: token'lar ve bileşenler tek ekranda. */
export function DesignSystemScreen() {
  const [selectedDay, setSelectedDay] = useState('10');
  const [tab, setTab] = useState<TabKey>('calendar');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ScreenHeader
            title="Pro · Tasarım Dili"
            subtitle="Form dili 1b · Yumuşak"
            trailing={<IconButton accessibilityLabel="Bildirimler" icon={<BellIcon size={size.icon} color={colors.text} />} />}
          />
        </View>

        <Section title="Palet" note="Renk tek başına bilgi taşımaz. Açık mavi ve açık kırmızı yalnız dolgudur; üstündeki metin her zaman mürekkep rengindedir.">
          <View style={styles.swatchGrid}>
            {swatches.map((s) => (
              <View key={s.name} style={styles.swatch}>
                <View style={[styles.swatchColor, { backgroundColor: s.value }, s.value === palette.white && styles.swatchOutline]} />
                <Text variant="rowTitle" style={styles.swatchName}>{s.name}</Text>
                <Text variant="meta">{s.value}</Text>
                <Text variant="meta" style={styles.swatchUse}>{s.use}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Tipografi · Plus Jakarta Sans">
          <View style={styles.list}>
            {typeSamples.map((t) => (
              <View key={t.variant} style={styles.typeRow}>
                <Text variant="meta">{t.spec}</Text>
                <Text variant={t.variant}>{t.sample}</Text>
              </View>
            ))}
            <View style={[styles.typeRow, styles.typeRowLast]}>
              <Text variant="meta">rozet · 700/10.5 · +6%</Text>
              <View style={styles.inline}>
                <Badge label="Ödendi" tone="info" />
                <Badge label="Bekliyor" tone="alert" />
              </View>
            </View>
          </View>
        </Section>

        <Section title="Gün şeridi" note="Gri: sıradan gün · açık mavi: dersi/müsaitliği olan gün · mürekkep: seçili gün.">
          <WeekStrip days={week} selectedKey={selectedDay} onSelect={setSelectedDay} />
        </Section>

        <Section title="Ders satırı" note="Soldaki çizgi mürekkep; dikkat gerektiren satırda açık kırmızı.">
          <View style={styles.rows}>
            <SectionHeader title="Bugün · 10 Eylül" actionLabel="Günü düzenle" onActionPress={() => {}} />
            <LessonRow time="09:00" duration="60 dk" title="Elif Yıldırım" subtitle="Bireysel · Stüdyo A" trailing={<Badge label="Ödendi" />} onPress={() => {}} />
            <LessonRow
              time="11:30"
              duration="90 dk"
              title="Mert Kaya"
              subtitle="Grup · 3 kişi"
              accentColor={colors.alert}
              trailing={<Badge label="Bekliyor" tone="alert" />}
              onPress={() => {}}
            />
            <LessonRow time="16:00" duration="60 dk" title="Deniz Arslan" subtitle="Bireysel · Online" trailing={<Badge label="Ödendi" />} onPress={() => {}} />
          </View>
        </Section>

        <Section title="Butonlar">
          <View style={styles.rows}>
            <Button label="Rezervasyon ekle" onPress={() => {}} />
            <Button label="Pasif" disabled />
          </View>
        </Section>
      </ScrollView>

      <TabBar active={tab} onChange={setTab} />
    </SafeAreaView>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="sectionTitle" accessibilityRole="header">{title}</Text>
      {note != null && <Text variant="caption">{note}</Text>}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.screen,
    gap: 28,
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.header,
  },
  section: {
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  sectionBody: {
    marginTop: spacing.sm,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatch: {
    width: '31%',
    flexGrow: 1,
  },
  swatchColor: {
    height: 64,
    borderRadius: radius.control,
  },
  swatchOutline: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  swatchName: {
    marginTop: 8,
    fontSize: 12,
  },
  swatchUse: {
    marginTop: spacing.xxs,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.row,
    paddingHorizontal: spacing.xxl,
  },
  typeRow: {
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  typeRowLast: {
    borderBottomWidth: 0,
  },
  inline: {
    flexDirection: 'row',
    gap: 8,
  },
  rows: {
    gap: spacing.md,
  },
});

