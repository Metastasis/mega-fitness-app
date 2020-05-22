import React from 'react';
import { Text, Button, Overlay, Input } from 'react-native-elements';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const GoalOverlay = ({
  onGoalButtonPress,
  isOverlayVisible,
  toggleIsOverlayVisible,
  goalCalories,
  setGoalCalories,
  onConfirmButtonPress,
}) => (
  <View>
    <Button title="Set a day goal" onPress={onGoalButtonPress} />
    <Overlay
      isVisible={isOverlayVisible}
      onBackdropPress={() => toggleIsOverlayVisible(false)}
    >
      <View style={styles.overlayContentContainer}>
        <Text h3>Let's set a goal!</Text>
        <Text h4>How many calories for today?</Text>
        <Input
          containerStyle={styles.inputContainer}
          value={goalCalories}
          onChangeText={(value) => setGoalCalories(value)}
          keyboardType="number-pad"
        />
        <View style={styles.buttonContainer}>
          <Button title="Confirm" onPress={onConfirmButtonPress} />
          <Button
            title="Cancel"
            onPress={() => toggleIsOverlayVisible(false)}
          />
        </View>
      </View>
    </Overlay>
  </View>
);

GoalOverlay.propTypes = {
  onGoalButtonPress: PropTypes.func.isRequired,
  isOverlayVisible: PropTypes.bool.isRequired,
  toggleIsOverlayVisible: PropTypes.func.isRequired,
  goalCalories: PropTypes.number.isRequired,
  setGoalCalories: PropTypes.func.isRequired,
  onConfirmButtonPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  overlayContentContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  inputContainer: {
    marginVertical: 0,
    marginHorizontal: 0,
    width: 200,
    padding: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
});

export default GoalOverlay;
