import React from 'react'
import {Button, Stack, View, XStack} from "tamagui";
import ColorPicker, {Swatches} from "reanimated-color-picker";
import DialogContainer from "../DialogContainer";
import {ChevronDown, ChevronUp} from "@tamagui/lucide-icons";

interface SwatchColorPickerProps {
    active_color: string

    setColor(color: string): void

    onPickerOpenOrClose?(state: boolean): void

    picker_open?: boolean

    close_on_select?: boolean
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

export default function SwatchColorPicker({
                                              active_color,
                                              setColor,
                                              picker_open,
                                              onPickerOpenOrClose,
                                              close_on_select,
                                          }: SwatchColorPickerProps) {
    const [dialog_open, setDialogOpen] = React.useState<boolean>(false)

    // if picker open has been set to either true or false, then set the dialog open state to that value
    React.useEffect(() => {
        if (picker_open !== undefined) {
            setDialogOpen(picker_open)
        }
    }, [picker_open])

    // if the dialog open state changes, then call the onPickerOpenOrClose callback
    React.useEffect(() => {
        if (onPickerOpenOrClose) {
            onPickerOpenOrClose(dialog_open)
        }
    }, [dialog_open])

    return (
        <React.Fragment>
            <XStack w={'100%'} paddingVertical={10} alignItems={'center'} justifyContent={'space-between'}
                    onPress={() => setDialogOpen(!dialog_open)} paddingRight={10}>
                <View w={'60%'} h={50} borderRadius={5} borderWidth={1} borderColor={'#bbb'}
                      backgroundColor={active_color}/>
                {
                    dialog_open ? <ChevronUp size={20} color={'#555'}/> : <ChevronDown size={20} color={'#555'}/>
                }
            </XStack>
            {dialog_open && (
                <DialogContainer onClose={() => setDialogOpen(false)}>
                    <ColorPicker value={active_color} onChange={(colors) => {
                        if (close_on_select) {
                            setDialogOpen(false)
                        }
                        setColor(colors.hex)
                    }}>
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
