import React, { useState } from 'react'; 
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Audio } from "expo-av";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function App() {
  const [recording, setRecording] = useState(); 
  const [recordings, setRecordings] = useState([]); 
  const [message, setMessage] = useState(""); 

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true 
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording); 
      } else {
        setMessage("Please grant permission to the app to access the microphone");
      }
    } catch (err) {
      console.log('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
  
    try {
      await recording.stopAndUnloadAsync();
      setRecording(null); 
      
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      const durationFormatted = getDurationFormatted(status.durationMillis); 
      const updatedRecordings = [...recordings];
      updatedRecordings.push({
        sound: sound,
        duration: durationFormatted,
        file: recording.getURI()
      });
      setRecordings(updatedRecordings);
    } catch (error) {
      console.error('Error while stopping and creating loaded sound:', error);
    }
  }
  
  async function deleteRecording(index) {
    const updatedRecordings = [...recordings];
    const recordingToDelete = updatedRecordings[index];
    if (recordingToDelete.sound) {
      await recordingToDelete.sound.unloadAsync();
    }
    updatedRecordings.splice(index, 1);
    setRecordings(updatedRecordings);
  }
  
  function getDurationFormatted(millis) {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const secondsDisplay = seconds % 60;
    const secondsDisplayFormatted = secondsDisplay < 10 ? `0${secondsDisplay}` : secondsDisplay;
    return `${minutes}:${secondsDisplayFormatted}`;
  }
  
  function getRecordingLines() {
    return recordings.map((recordingLine, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.fill}>Recording {index + 1} - {recordingLine.duration}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity // Replace Button with TouchableOpacity
            style={styles.button}
            onPress={() => recordingLine.sound.replayAsync()}
          >
            <FontAwesome5 name="play-circle" size={30} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity // Replace Button with TouchableOpacity
            style={styles.buttonDelete}
            onPress={() => deleteRecording(index)}
          >
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  }
  
  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <TouchableOpacity // Replace Button with TouchableOpacity
        title={recording ? 'Stop Recording' : 'Start Recording'} 
        onPress={recording ? stopRecording : startRecording}
        style={styles.button}
      >
        <FontAwesome5 name={recording ? "stop-circle" : "play-circle"} size={30} color="white" />
      </TouchableOpacity>
      {getRecordingLines()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1, 
    margin: 16
  },
  button: {
    margin: 16,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDelete: {
    margin: 8, 
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    margin: 8, 
  },
});
