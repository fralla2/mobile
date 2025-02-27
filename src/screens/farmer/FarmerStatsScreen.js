/* eslint-disable no-nested-ternary */
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSetRecoilState } from 'recoil';
import { farmerRefreshState } from '../../Atoms';
import CustomCard from '../../components/CustomCard';
import { formatBytes, formatPrice } from '../../utils/Formatting';
import { getCurrencyFromKey } from '../CurrencySelectionScreen';

const Item = ({ title, value, color, loadable, format }) => {
  const theme = useTheme();
  return (
    <CustomCard style={styles.item}>
      <Text style={{ color, fontSize: 16, textAlign: 'center' }}>{title}</Text>
      <Text
        style={{
          textAlign: 'center',
          // marginTop: 10,
          // marginBottom: 10,
          fontSize: 20,
          // color: theme.colors.textGrey,
        }}
      >
        {loadable.state === 'hasValue' ? format(loadable.contents.partials) : '...'}
      </Text>
    </CustomCard>
  );
};

const HeaderItem = ({ loadable, launcherId, currency, t, theme }) => (
  <CustomCard style={styles.headerItem}>
    <View style={{ display: 'flex', flexDirection: 'row' }}>
      <Text style={{ flex: 1, color: theme.colors.textGrey }}>{t('common:friendlyName')}:</Text>
      <Text>
        {loadable.state === 'hasValue'
          ? loadable.contents.farmer.name
            ? loadable.contents.farmer.name
            : 'None'
          : '...'}
      </Text>
    </View>
    <View style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
      <Text style={{ color: theme.colors.textGrey }}>Launcher ID:</Text>
      <TouchableOpacity
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 20 }}
        onPress={() => Clipboard.setString(launcherId)}
      >
        <Text style={{ textAlign: 'center', marginEnd: 16 }}>{launcherId}</Text>
        <MaterialCommunityIcons name="content-copy" size={16} color="grey" />
      </TouchableOpacity>
    </View>
    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 6 }}>
      <Text style={{ flex: 1, color: theme.colors.textGrey }}>{t('common:difficulty')}:</Text>
      <Text style={{}}>
        {loadable.state === 'hasValue' ? loadable.contents.farmer.difficulty : '...'}
      </Text>
    </View>
    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 6 }}>
      <Text style={{ flex: 1, color: theme.colors.textGrey }}>{t('common:joinedAt')}:</Text>
      {/* <Text style={{}}>{format(new Date(item.joined_at), 'PPpp')}</Text> */}
      <Text style={{}}>
        {loadable.state === 'hasValue'
          ? format(new Date(loadable.contents.farmer.joined_at), 'PPpp')
          : '...'}
      </Text>
    </View>
    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 6 }}>
      <Text style={{ flex: 1, color: theme.colors.textGrey }}>
        {t('common:estimatedDailyEarnings')}:
      </Text>
      <Text>
        {loadable.state === 'hasValue'
          ? `${formatPrice(
              (loadable.contents.farmer.estimated_size / 1099511627776) *
                loadable.contents.stats.xch_tb_month *
                loadable.contents.stats.xch_current_price[currency],
              currency
            )}  ${getCurrencyFromKey(currency)}`
          : '...'}
      </Text>
    </View>
    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 6 }}>
      <Text style={{ flex: 1, color: theme.colors.textGrey }}>{t('common:points')}:</Text>
      <Text>{loadable.state === 'hasValue' ? loadable.contents.farmer.points : '...'}</Text>
    </View>
    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 6 }}>
      <Text style={{ flex: 1, color: theme.colors.textGrey }}>{t('common:utilizationSpace')}:</Text>
      <Text>
        {loadable.state === 'hasValue'
          ? `${loadable.contents.farmer.points_of_total.toFixed(5)}%`
          : '...'}
      </Text>
      {/* <Text style={{}}>{formatBytes(item.estimated_size)}</Text> */}
    </View>
    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 6 }}>
      <Text style={{ flex: 1, color: theme.colors.textGrey }}>{t('common:estimatedSize')}:</Text>
      <Text>
        {loadable.state === 'hasValue'
          ? formatBytes(loadable.contents.farmer.estimated_size)
          : '...'}
      </Text>
      {/* <Text style={{}}>{formatBytes(item.estimated_size)}</Text> */}
    </View>
  </CustomCard>
);

const useRefresh = () => {
  const setRequestId = useSetRecoilState(farmerRefreshState());
  return () => setRequestId((id) => id + 1);
};

const FarmerStatsScreen = ({ launcherId, dataLoadable, navigation }) => {
  const refresh = useRefresh();
  const errors = [];
  const harvesters = new Set();
  const { t } = useTranslation();
  const theme = useTheme();
  let points = 0;

  if (dataLoadable.state === 'hasValue') {
    dataLoadable.contents.partials.results.forEach((item) => {
      harvesters.add(item.harvester_id);
      if (item.error !== null) {
        errors.push(errors);
      } else {
        points += item.difficulty;
      }
    });
  }

  const { currency } = dataLoadable.contents;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 4, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => refresh()} />}
    >
      <HeaderItem
        loadable={dataLoadable}
        launcherId={launcherId}
        currency={currency}
        t={t}
        theme={theme}
      />
      <View style={styles.container}>
        <Item
          loadable={dataLoadable}
          format={(item) => item.count}
          color="#4DB33E"
          title={`${t('common:partials').toUpperCase()}\n(${t('common:24Hours').toUpperCase()})`}
          // title={`PARTIALS\n(24 HOURS)`}
        />
        <Item
          loadable={dataLoadable}
          format={() => points}
          color="#4DB33E"
          title={`${t('common:points').toUpperCase()}\n(${t('common:24Hours').toUpperCase()})`}
        />
      </View>
      <View style={styles.container}>
        <Item
          loadable={dataLoadable}
          format={(item) => item.count - errors.length}
          color="#3DD292"
          title={`${t('common:successful').toUpperCase()}\n${t('common:partials').toUpperCase()}`}
        />
        <Item
          loadable={dataLoadable}
          format={() => errors.length}
          color="#FB6D4C"
          title={`${t('common:failed').toUpperCase()}\n${t('common:partials').toUpperCase()}`}
        />
      </View>
      <View style={styles.container}>
        <Item
          loadable={dataLoadable}
          format={(item) => `${(((item.count - errors.length) * 100) / item.count).toFixed(1)}%`}
          color="#FB6D4C"
          title={`${t('common:partial').toUpperCase()}\n${t('common:performance').toUpperCase()}`}
        />
        <Item
          loadable={dataLoadable}
          format={() => harvesters.size}
          color="#34D4F1"
          title={`${t('common:harvesters').toUpperCase()}\n${t('common:count').toUpperCase()}`}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    display: 'flex',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  headerItem: {
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 6,
  },
});

export default FarmerStatsScreen;
