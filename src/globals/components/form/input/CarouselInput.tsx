import React from 'react'
import Carousel from 'react-native-reanimated-carousel'
import {Paragraph, Stack, View} from "tamagui";

export interface CarouselItem {
    key: React.Key
    display_value: string
    return_value: any
}

interface CarouselInputProps {
    items: CarouselItem[]
    orientation?: 'horizontal' | 'vertical'
    initial_item?: CarouselItem
    setActiveValue: (value: any) => void
    width: number
    height: number
}

export default function CarouselInput({items,orientation,initial_item, setActiveValue, width, height}: CarouselInputProps) {
    return (
        <Carousel
            loop
            width={width}
            height={height}
            vertical={orientation === 'vertical'}
            data={items}
            defaultIndex={items.findIndex((item) => item.key === initial_item?.key) ?? 0}
            scrollAnimationDuration={500}
            onSnapToItem={(index) => setActiveValue(items[index].return_value)}
            renderItem={({item}) => (
                <Stack justifyContent={'center'} alignItems={'center'} width={'100%'} height={'100%'}>
                    <Paragraph w={'100%'} fontSize={20} textAlign={'center'}>{item.display_value}</Paragraph>
                </Stack>
            )}
        />
    )

}