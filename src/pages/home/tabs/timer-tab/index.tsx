import React from 'react'
import {Button, Paragraph, YStack} from "tamagui";
import {useDispatch} from "react-redux";


export default function TimerTab() {
    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
            <Paragraph color={'$color'} jc={'center'}>Timer</Paragraph>
        </YStack>
    )
}
