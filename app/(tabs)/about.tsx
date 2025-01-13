import {Text, View, StyleSheet} from "react-native";

export default function About() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Placeholder</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',

    },
});