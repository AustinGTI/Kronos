import React from 'react'
import {Button, Stack, View, XStack} from "tamagui";
import ColorPicker, {Swatches} from "reanimated-color-picker";
import DialogContainer from "../DialogContainer";
import {ChevronDown, ChevronUp} from "@tamagui/lucide-icons";
import {AccordionContext} from "../../wrappers/Accordion";

interface SwatchColorPickerProps {
    active_color: string

    setColor(color: string): void

    accordion_id?: string
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
                                              accordion_id,
                                              close_on_select,
                                          }: SwatchColorPickerProps) {
    const {addDialog, removeDialog, dialogIsOpen} = React.useContext(AccordionContext)

    const [dialog_open, setDialogOpen] = React.useState<boolean>(false)

    // if the dialog_open state changes and accordion id has been set, add or remove the dialog from the context
    React.useEffect(() => {
        if (accordion_id) {
            if (dialog_open) {
                addDialog(accordion_id)
            } else {
                removeDialog(accordion_id)
            }
        }
    }, [dialog_open, accordion_id]);

    // check if the dialog is still open and close it if not according to the dialogIsOpen function from the context
    React.useEffect(() => {
        if (accordion_id && !dialogIsOpen(accordion_id)) {
            setDialogOpen(false)
        }
    }, [accordion_id, dialogIsOpen])


    return (
        <React.Fragment>
            <XStack w={'100%'} paddingVertical={10} alignItems={'center'} justifyContent={'space-between'}
                    onPress={() => setDialogOpen(!dialog_open)}>
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
