import React from 'react'
import {View} from "tamagui";
import {heightPercentageToDP} from "react-native-responsive-screen";


export default function ThemeButton() {
    return (
        <View
            borderRadius={20}
            h={heightPercentageToDP('4%')}
            w={heightPercentageToDP('9%')}
            borderColor={'#eee'}
            borderWidth={1}
            backgroundColor={'white'}>

        </View>
    );
}
