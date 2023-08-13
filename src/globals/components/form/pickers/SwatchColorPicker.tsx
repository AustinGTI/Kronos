import React from 'react'
import {Button, Stack, View, XStack} from "tamagui";
import ColorPicker, {Swatches} from "reanimated-color-picker";
import DialogContainer from "../DialogContainer";

interface SwatchColorPickerProps {
    active_color: string

    setColor(color: string): void
}

const SWATCH_COLORS = [
    '#ffffff',
    '#000000',
    '#f44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#9E9E9E',
    '#607D8B',
];

export default function SwatchColorPicker({active_color, setColor}: SwatchColorPickerProps) {
    const [dialog_open, setDialogOpen] = React.useState<boolean>(false)
    return (
        <React.Fragment>
            <XStack w={'100%'} paddingVertical={10} alignItems={'center'} justifyContent={'space-between'}>
                <View w={'60%'} h={50} borderRadius={5} borderWidth={1} borderColor={'#bbb'} backgroundColor={active_color}/>
                <Button onPress={() => setDialogOpen(true)}>Select</Button>
            </XStack>
            {dialog_open && (
                <DialogContainer onClose={() => setDialogOpen(false)}>
                    <ColorPicker value={active_color} onChange={(colors) => setColor(colors.hex)}>
                        <Swatches
                            style={{marginVertical: 5}}
                            swatchStyle={{borderRadius: 5, width: 30, height: 30}}
                            colors={SWATCH_COLORS}
                        />
                    </ColorPicker>
                </DialogContainer>
            )}
        </React.Fragment>
    );
}
