import React from 'react'
import {Paragraph, ScrollView, XStack, YStack} from "tamagui";
import {ChevronDown, ChevronUp} from "@tamagui/lucide-icons";

interface SelectPickerProps<Item> {
    items: Item[]
    selected_item: Item | null
    onSelectItem: (item: Item) => void
    placeholder?: string
    max_dropdown_height?: number
    DropdownItemRenderer?: React.ComponentType<{ item: Item }>
    SelectedItemRenderer?: React.ComponentType<{ item: Item }>
}

export default function DropdownSelectPicker<Item>({
                                                       items,
                                                       selected_item,
                                                       onSelectItem,
                                                       placeholder = 'Select...',
                                                       max_dropdown_height = 100,
                                                       DropdownItemRenderer,
                                                       SelectedItemRenderer
                                                   }: SelectPickerProps<Item>) {
    const [dropdown_open, setDropdownOpen] = React.useState<boolean>(false)
    return (
        <YStack w={'100%'}>
            <XStack w={'100%'} onPress={() => setDropdownOpen(!dropdown_open)} paddingVertical={10}
                    paddingHorizontal={5} alignItems={'center'}
                    justifyContent={'space-between'}>
                {
                    selected_item ?
                        SelectedItemRenderer ?
                            <SelectedItemRenderer item={selected_item}/> :
                            <Paragraph>{selected_item}</Paragraph> :
                        <Paragraph>{placeholder}</Paragraph>
                }
                {
                    dropdown_open ?
                        <ChevronUp size={20} color={'#555'}/> :
                        <ChevronDown size={20} color={'#555'}/>
                }
            </XStack>
            {dropdown_open && (
                <ScrollView
                    w={'100%'} maxHeight={max_dropdown_height}
                    backgroundColor={'#fff'} borderBottomWidth={1} borderTopWidth={1}
                    overflow={'scroll'} borderColor={'#bbb'}>
                    <YStack w={'100%'} alignItems={'center'}>
                        {items.map((item, index) => {
                            return (
                                <React.Fragment>
                                    <XStack key={index} w={'100%'} paddingVertical={10} paddingHorizontal={10}
                                            onPress={() => {
                                                onSelectItem(item)
                                                setDropdownOpen(false)
                                            }}>
                                        {DropdownItemRenderer ? <DropdownItemRenderer item={item}/> :
                                            <Paragraph>{item}</Paragraph>}
                                    </XStack>
                                    {index !== items.length - 1 && (
                                        <XStack w={'90%'} height={1} backgroundColor={'#ddd'}/>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </YStack>
                </ScrollView>
            )
            }

        </YStack>
    )
        ;
}
