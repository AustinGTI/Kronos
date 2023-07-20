import React from 'react'
import {Paragraph, YStack} from "tamagui";


export default function CalendarTab() {
    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
            <Paragraph color={'$color'} jc={'center'}>Calendar</Paragraph>
        </YStack>
    )
}