import React from 'react'
import {Paragraph, YStack} from "tamagui";


export default function TimerTab() {
    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
            <Paragraph color={'$color'} jc={'center'}>Timer</Paragraph>
        </YStack>
    )
}
