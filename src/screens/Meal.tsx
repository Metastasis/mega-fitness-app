import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import {
  Button,
  Text,
  Divider,
  Card,
  ListItem,
  withTheme,
  Input,
} from 'react-native-elements';
import PropTypes from 'prop-types';
import FoodCard from '../components/FoodCard';
import { container as MealContainer } from '../store/reducers/Meal';
import { container as UserContainer } from '../store/reducers/User'
import { firestoreService } from '../Firebase';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import TotalCard from '../components/TotalCard';

function Meal({ navigation, route, theme, meal, updateMeal, user }): JSX.Element {

  const mealDocument = route.params.document;

  const [eatenAt, changeEatenAt] = useState(mealDocument.eatenAt);
  const [displayCalendar, toggleDisplayCalendar] = useState(false);
  const [mealName, changeMealName] = useState(mealDocument.mealName || '')
  const [documentId, setDocumentId] = useState(null);

  const title = eatenAt.toLocaleString('en');

  navigation.setOptions({ title });

  const removeFoodFromMeal = (mealIndex: number): void => {
    const updatedArray = meal.filter((meal: {[key:string]: any}, index: number) => index !== mealIndex);
    updateMeal(updatedArray);
  }

  const getEatenAt = (): void => {
    toggleDisplayCalendar(true);
  }

  const sendMealToFirestore = async (datetime: Date): Promise<void> => {
    try {
      if(documentId){
        await firestoreService.updateMeal(meal, mealName, user.uid, datetime, documentId);        
      } else{
        await firestoreService.createMeal(meal, mealName, user.uid, datetime);
      }
      navigation.navigate('Day', {date: eatenAt});
    } catch (e) {
      console.log(e);
    }
  }

  const setDate = (datetime: Date) => {
    toggleDisplayCalendar(false);
    changeEatenAt(datetime);
    askToSave(datetime);
  }

  const askToSave = (datetime: Date): void => {
    Alert.alert("Save", "Do you want to save the meal?", [
      {text: "No", onPress: () => null},
      {text: "Yes", onPress: () => sendMealToFirestore(datetime)},
    ]);
  }

  const deleteMeal = async () => {
    try{
      await firestoreService.deleteMeal(documentId);
      navigation.navigate('Day', {date: eatenAt});
    } catch (e) {
      console.log(e);
    }
  }

  const confirmDelete = () => {
    Alert.alert("Delete", "Do you want to delete this meal?", [
      {text: "No", onPress: () => null},
      {text: "Yes", onPress: () => deleteMeal()}
    ]);
  }

  useEffect(() => {
    const document = route.params.document;
    updateMeal(document.meal);
    changeEatenAt(document.eatenAt);
    setDocumentId(document.id);
  }, [])

  return (
    <ScrollView>
      <View>
        {meal.length ? (
          meal.map((food: {[key: string]: any }, index: number) => (
            <FoodCard
              name={food.name}
              portion={food.portion}
              calories={food.calories.toString()}
              protein={food.protein.toString()}
              carbs={food.carbs.toString()}
              fats={food.fats.toString()}
              key={index}
            >
            <Button
                title="Delete food"
                onPress={() => removeFoodFromMeal(index)}
                buttonStyle={{
                  backgroundColor: theme.colors.danger
                }}
              />
            </FoodCard>
          ))
        ) : (
          <Text>No foods added to this meal</Text>
        )}
        <Button
          title="Add a food"
          onPress={(): void => navigation.navigate('Search')}
        />
        {meal.length ? (
          <View>
            <Divider />
            <TotalCard foods={meal} />
            <Input 
              placeholder="Enter meal name"
              value={mealName}
              onChangeText={(value) => changeMealName(value)} 
            />
            <DateTimePickerModal
              isVisible={displayCalendar}
              date={eatenAt}
              mode="datetime"
              onConfirm={setDate}
              onCancel={() => toggleDisplayCalendar(false)}
            />
            <Text>{eatenAt.toString()}</Text>
            <Button
              title="Save meal"
              onPress={getEatenAt} 
              buttonStyle={{
                backgroundColor: theme.colors.success
              }}
            />
            {documentId ? 
              <Button
                title="Delete meal"
                onPress={confirmDelete}
                buttonStyle={{
                  backgroundColor: theme.colors.danger
                }}
              /> 
            : null}
          </View>
        ) : null}
        </View>
    </ScrollView>
  );
}

Meal.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
  theme: PropTypes.shape({
    colors: PropTypes.object.isRequired,
  }).isRequired,
  meal: PropTypes.arrayOf(PropTypes.object).isRequired,
  route: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
  updateMeal: PropTypes.func.isRequired,
  user: PropTypes.shape({
    uid: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
};

export default UserContainer(MealContainer(withTheme(Meal)));
