import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    console.log("Camera ref:", cameraRef.current);
  }, [cameraRef.current]);

  useEffect(() => {
    if (permission?.granted) {
      console.log("Camera permissions granted");
    }
  }, [permission]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePictureAsync = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log("Photo URI:", photo.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    } else {
      console.log("Camera ref is null");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        type="back"
        ratio="16:9"
        onPictureSaved={(photo) => console.log("Saved photo:", photo.uri)}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={takePictureAsync} style={styles.button}>
          <Text style={styles.text}>Take Picture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "grey",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1 / 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 20,
    borderColor: "grey",
  },
  button: {
    flex: 1,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
});
