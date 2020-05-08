import React, { useState } from 'react';
import { View, FlatList, Switch, StyleSheet } from 'react-native';
import {
  Text,
  SearchBar,
  Button,
  ListItem,
  Tooltip,
  Icon,
} from 'react-native-elements';
import PropTypes from 'prop-types';
import USDAApiImpl from '../ApiHelpers/USDA/USDAApiImpl';
import OFDApiImpl from '../ApiHelpers/OFD/OFDApiImpl';
import { FoodResult, FoodDetails } from '../ApiHelpers/CommonAPITypes';
import Toast from 'react-native-simple-toast';

export default function Search({ navigation }): JSX.Element {
  const USDAapi = new USDAApiImpl();
  const OFDApi = new OFDApiImpl();

  const [searchText, updateSearchText] = useState('');
  const [results, updateResults] = useState(null);
  const [page, updatePage] = useState(0);
  const [loadingState, setLoadingState] = useState(false);
  const [isFranceLocale, setIsFranceLocale] = useState(true);
  const [shouldUseOFD, setShouldUseOFD] = useState(true);

  const getApiToolTipText = () =>
    shouldUseOFD
      ? 'The Open Food Database is preferable for brand name foods.'
      : 'The USDA database is preferable for basic foods and ingredients.';

  const getLocaleToolTipText = () =>
    'The Open Food Database can search for American or French brands.';

  const handleSubmit = async (): Promise<void> => {
    updateResults(null);
    updatePage(0);
    if (searchText) {
      getResults();
    }
  };

  const getResults = async () => {
    setLoadingState(true);
    if (shouldUseOFD) {
      updateResults(
        results && results.length
          ? [
              ...results,
              ...(await OFDApi.search(searchText, isFranceLocale, page)),
            ]
          : [...(await OFDApi.search(searchText, isFranceLocale, page))]
      );
    } else {
      updateResults(
        results && results.length
          ? [...results, ...(await USDAapi.search(searchText, page))]
          : [...(await USDAapi.search(searchText, page))]
      );
    }
    updatePage(page + 1);
    setLoadingState(false);
  };

  const showErrorToast = () =>
    Toast.showWithGravity(
      'There was an error getting your food data',
      Toast.LONG,
      Toast.CENTER
    );

  const goToFoodDetails = async (api: string, id: string): Promise<void> => {
    try {
      let details: FoodDetails;
      switch (api) {
        case 'Open Food Data':
          details = await OFDApi.getDetails(id);
          break;
        case 'USDA':
          details = await USDAapi.getDetails(id);
          break;
        default:
          details = null;
      }

      if (details) {
        navigation.navigate('Details', { details });
      } else {
        showErrorToast();
      }
    } catch (e) {
      showErrorToast();
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Text h2>Search for a food</Text>
      <SearchBar
        value={searchText}
        onChangeText={(text): void => updateSearchText(text)}
        containerStyle={{
          marginVertical: 10,
        }}
      />
      <View style={styles.switchGroupContainer}>
        <View style={styles.emptyContainer} />
        <Text style={styles.textContainer}>
          {shouldUseOFD ? 'Open Food Data' : 'USDA'}
        </Text>
        <Switch value={shouldUseOFD} onValueChange={setShouldUseOFD} />
        <Tooltip height={100} popover={<Text>{getApiToolTipText()}</Text>}>
          <Icon containerStyle={styles.icon} name="info" />
        </Tooltip>
        <View style={styles.emptyContainer} />
      </View>
      <View style={styles.switchGroupContainer}>
        <View style={styles.emptyContainer} />
        <Text style={styles.textContainer}>
          {!shouldUseOFD ? 'USA' : isFranceLocale ? 'France' : 'USA'}
        </Text>
        <Switch
          value={!shouldUseOFD ? false : isFranceLocale}
          onValueChange={setIsFranceLocale}
          disabled={!shouldUseOFD}
        />
        <Tooltip height={100} popover={<Text>{getLocaleToolTipText()}</Text>}>
          <Icon containerStyle={styles.icon} name="info" />
        </Tooltip>
        <View style={styles.emptyContainer} />
      </View>
      <Button
        type={!searchText ? 'outline' : 'solid'}
        disabled={!searchText}
        loading={loadingState}
        raised
        title="Search"
        onPress={(): Promise<void> => handleSubmit()}
      />
      {results ? (
        results.length ? (
          <FlatList
            data={results}
            keyExtractor={(item, index): string => index.toString()}
            renderItem={({ item }: { item: FoodResult }): JSX.Element => (
              <ListItem
                onPress={(): Promise<void> =>
                  goToFoodDetails(item.api, item.id)
                }
                title={item.description}
              />
            )}
            onEndReachedThreshold={0.5}
            onEndReached={getResults}
          />
        ) : (
          <Text>No items found</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  switchGroupContainer: {
    flexDirection: 'row',
  },
  textContainer: {
    flex: 2,
  },
  emptyContainer: {
    flex: 1,
  },
  icon: {
    marginHorizontal: 15,
  },
});

Search.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
