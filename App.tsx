import React from "react";
import {StatusBar} from 'expo-status-bar';
import {Button, StyleSheet, Text, View} from 'react-native';

export default function App() {
    const [count, setCount] = React.useState<number>(0)

    React.useEffect(() => {
        console.log('another count has occurred')
    }, [count])

    const onClickButton = React.useCallback(() => {
        console.log('clicked')
        setCount(count + 2)
        console.log('stop before this')
    }, [count])

    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Button title={'Click me'} onPress={onClickButton}/>
            <StatusBar style="auto"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
