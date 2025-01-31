import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from "react-native";
import { sendImageToBackend } from "@/app/services/apiService";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [receiptText, setReceiptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const handleError = (error: Error) => {
    const errorMessage = error.message || 'An unexpected error occurred';
    setError(errorMessage);
    Alert.alert(
        "Error",
        errorMessage,
        [{ text: "OK", onPress: () => setError(null) }]
    );
  };

  const captureAndSendImage = async () => {
    if (!cameraRef.current) {
      handleError(new Error("Camera not ready"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      }).catch(error => {
        throw new Error(`Failed to capture image: ${error.message}`);
      });

      if (!photo.base64) {
        throw new Error("Failed to generate image data");
      }
      //console.log("base64 image", photo.base64)
      // Process image
      const processedText = await sendImageToBackend(photo.base64);
      setReceiptText(processedText);

    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to process receipt'));
    } finally {
      setIsLoading(false);
    }
  };



  if (!permission) {
    return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.message}>Loading camera...</Text>
        </View>
    );
  }

  if (!permission.granted) {
    return (
        <View style={styles.container}>
          <Text style={styles.message}>
            Camera access is required to scan receipts
          </Text>
          <Button onPress={requestPermission} title="Grant Permission" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <CameraView
            ref={cameraRef}
            style={styles.camera}
            type="back"
            ratio="16:9"
            onMountError={(error) => handleError(new Error(error.message))}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.guideText}>
            Position receipt within frame
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
              onPress={captureAndSendImage}
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
          >
            {isLoading ? (
                <ActivityIndicator color="black" size="small" />
            ) : (
                <Text style={styles.text}>Scan Receipt</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
        )}

        {receiptText && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                Extracted Text:
              </Text>
              <Text style={styles.resultText}>{receiptText}</Text>
            </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '80%',
    height: '40%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  guideText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  button: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  errorContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  resultContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 100,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 10,
    maxHeight: '30%',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
  },
});