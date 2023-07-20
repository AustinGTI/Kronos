import React from 'react'
import {Paragraph, YStack} from "tamagui";


export default function SessionsTab() {
    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
            <Paragraph color={'$color'} jc={'center'}>Sessions</Paragraph>
        </YStack>
    )
}
