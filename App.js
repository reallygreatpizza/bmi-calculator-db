import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('bmiDB.db');

const BMICalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBMI] = useState(null);
  const [bmiEntries, setBMIEntries] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS bmi_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, weight REAL, height REAL, bmi REAL);',
        [],
        () => console.log('Database table created successfully'),
        (error) => console.error('Error creating database table: ', error)
      );
    });
  }, []);

  const calculateBMI = () => {
    if (weight && height) {
      const bmiValue = (weight / (height * height)) * 703;
      setBMI(bmiValue.toFixed(2));
      const bmiCategory = assessBMICategory(bmiValue);
      const date = new Date().toLocaleDateString();
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO bmi_entries (date, weight, height, bmi) VALUES (?, ?, ?, ?)',
          [date, weight, height, bmiValue],
          () => {
            console.log('BMI entry inserted successfully');
            setWeight('');
            setHeight('');
            setBMIEntries([
              ...bmiEntries,
              {
                id: Date.now(),
                date,
                weight,
                height,
                bmi: bmiValue,
                category: bmiCategory,
              },
            ]);
          },
          (error) => console.error('Error inserting BMI entry: ', error)
        );
      });
    }
  };

  const assessBMICategory = (bmi) => {
    if (bmi < 18.5) {
      return 'Underweight';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      return 'Healthy';
    } else if (bmi >= 25 && bmi <= 29.9) {
      return 'Overweight';
    } else {
      return 'Obese';
    }
  };

  SplashScreen.preventAutoHideAsync();
  setTimeout(SplashScreen.hideAsync, 2000);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>BMI Calculator</Text>
        </View>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={(text) => setWeight(text)}
          keyboardType="numeric"
          placeholder="Weight (in pounds)"
        />
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={(text) => setHeight(text)}
          keyboardType="numeric"
          placeholder="Height (in inches)"
        />
        <Pressable style={styles.button} onPress={calculateBMI}>
          <Text style={styles.buttonText}>Compute BMI</Text>
        </Pressable>
        {bmi && (
          <View>
            <Text style={styles.bmiText}>
              Body Mass Index is {bmi} ({assessBMICategory(bmi)})
            </Text>
          </View>
        )}
        <View style={styles.bmiHistoryContainer}>
          <Text style={styles.bmiHistoryText}>BMI History:</Text>
          {bmiEntries.map((entry) => (
            <View key={entry.id} style={styles.bmiEntry}>
              <Text style={styles.bmiEntryText}>
                {entry.date}: {entry.bmi.toFixed(1)} (W:{entry.weight} lbs, H:{entry.height} inches)
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    height: 100,
  },
  toolbarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  input: {
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#34495e',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
  bmiText: {
    fontSize: 28,
    marginBottom: 1,
    marginHorizontal: 10,
    textAlign: 'center',
    padding: 25,
  },
  bmiHistoryContainer: {
    marginTop: 32,
  },
  bmiHistoryText: {
    fontSize: 24,
    marginBottom: 16,
  },
  bmiEntry: {
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
    padding: 16,
    marginBottom: 8,
  },
  bmiEntryText: {
    fontSize: 20,
  },
});

export default BMICalculator;