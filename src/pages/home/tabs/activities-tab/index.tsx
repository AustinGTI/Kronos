import React from 'react'
import {Button, Paragraph, YStack} from "tamagui";
import {useDispatch} from "react-redux";


export default function ActivitiesTab() {
    const dispatch = useDispatch()
    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
            <Paragraph color={'$color'} jc={'center'}>Sessions</Paragraph>
            <Button onPress={() => dispatch({type: 'test/setAge', payload: 20})}>Set age to 20</Button>
        </YStack>
    )
}
