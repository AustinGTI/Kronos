import React from 'react'
import {Button, Paragraph, YStack} from "tamagui";
import {useDispatch} from "react-redux";


export default function TimerTab() {
    const dispatch = useDispatch()
    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
            <Paragraph color={'$color'} jc={'center'}>Timer</Paragraph>
            <Button onPress={() => dispatch({type: 'test/setName', payload: 'John'})}>Set name to John</Button>
        </YStack>
    )
}
