import React from 'react'
import {Paragraph, YStack} from "tamagui";
import {useSelector} from "react-redux";


export default function CalendarTab() {
    const {name, age} = useSelector((state: any) => state.test)
    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
            <Paragraph color={'$color'} jc={'center'}>Calendar</Paragraph>
            <Paragraph color={'$color'} jc={'center'}>{`Name is ${name} and age is ${age}`}</Paragraph>
        </YStack>
    )
}