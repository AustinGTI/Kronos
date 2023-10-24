import React from 'react'
import {Paragraph, XStack, YStack} from "tamagui";
import {Trash2, Upload} from "@tamagui/lucide-icons";


export default function DataSetting() {
    return (
        <YStack w={'100%'} paddingVertical={10}>
            <XStack w={'100%'} paddingVertical={15} justifyContent={'space-between'} paddingHorizontal={5}>
                <Paragraph textTransform={'uppercase'} color={'#333'}>Export Data</Paragraph>
                <Upload size={25} color={'#555'}/>
            </XStack>
            <XStack w={'100%'} paddingVertical={15} justifyContent={'space-between'} paddingHorizontal={5}>
                <Paragraph color={'red'} textTransform={'uppercase'}>Delete Data</Paragraph>
                <Trash2 size={25} color={'red'}/>
            </XStack>
        </YStack>
    );
}
