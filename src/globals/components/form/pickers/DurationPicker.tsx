import React from 'react'
import {useSelector} from "react-redux";
import {AppState} from "../../../redux/reducers";
import {Duration} from "../../../types/main";
import {Adapt, Button, Dialog, DialogOverlay, Paragraph, ScrollView, Sheet, XStack, YStack} from "tamagui";
import DialogContainer from "../DialogContainer";
import {ChevronDown, ChevronUp} from "@tamagui/lucide-icons";
import plannerTabSelector from "../../../redux/selectors/plannerTabSelector";
import {AccordionContext} from "../../wrappers/Accordion";

interface DurationPickerPaneProps {
    duration: Duration,
    onClick: () => void,
    is_active: boolean
}

interface DurationPickerProps {
    setDuration: (duration: Duration) => void
    active_duration_id?: number
    accordion_id?: string
    close_on_select?: boolean
}

function DurationPickerPane({duration, onClick, is_active}: DurationPickerPaneProps) {
    return (
        <XStack justifyContent={'space-between'} alignItems={'center'}
                marginVertical={5} padding={10} backgroundColor={'$background'}
                borderRadius={10} borderColor={'$color'} width={'95%'}>
            <Paragraph color={'$color'}
                       textDecorationLine={is_active ? 'underline' : 'none'}>{duration.name}</Paragraph>
            <Button onPress={onClick}>Select</Button>
        </XStack>
    )
}

export default function DurationPicker({
                                           active_duration_id,
                                           setDuration,
                                           accordion_id,
                                           close_on_select
                                       }: DurationPickerProps) {
    const {addDialog, removeDialog, dialogIsOpen} = React.useContext(AccordionContext)

    const {durations} = useSelector(plannerTabSelector)
    const [dialog_open, setDialogOpen] = React.useState(false)

    const selected_duration = React.useMemo(() => (
        active_duration_id !== undefined && durations[active_duration_id] ? durations[active_duration_id] : null
    ), [active_duration_id, durations])

    const handleClickDuration = React.useCallback((duration: Duration) => {
        setDuration(duration)
        if (close_on_select) {
            setDialogOpen(false)
        }
    }, [setDuration, setDialogOpen, close_on_select])

    // when the dialog_open state changes, add or remove dialog from context if accordion id is set
    React.useEffect(() => {
        if (accordion_id) {
            if (dialog_open) {
                addDialog(accordion_id)
            } else {
                removeDialog(accordion_id)
            }
        }
    }, [accordion_id, dialog_open])

    // check if dialog is open according to the context, if not then set the dialog open state to false
    React.useEffect(() => {
        if (accordion_id && !dialogIsOpen(accordion_id)) {
            setDialogOpen(false)
        }
    }, [accordion_id, dialogIsOpen])

    return (
        <React.Fragment>
            <XStack paddingVertical={20} alignItems={'center'} justifyContent={'space-between'}
                    onPress={() => setDialogOpen(!dialog_open)}>
                <Paragraph width={'60%'}>
                    {selected_duration?.name ?? 'Select a increment...'}
                </Paragraph>
                {/*<Button onPress={() => setDialogOpen(true)}>Select</Button>*/}
                {
                    dialog_open ? <ChevronUp size={20} color={'#555'}/> : <ChevronDown size={20} color={'#555'}/>
                }
            </XStack>
            {dialog_open &&
                <DialogContainer onClose={() => setDialogOpen(false)} maxHeight={200}>
                    <YStack width={'100%'} alignItems={'center'} borderWidth={1} paddingVertical={5}>
                        {Object.values(durations).map((duration) => (
                            <DurationPickerPane
                                key={duration.id}
                                duration={duration}
                                is_active={selected_duration?.id === duration.id}
                                onClick={() => handleClickDuration(duration)}/>
                        ))}
                    </YStack>
                </DialogContainer>
            }
        </React.Fragment>
    );
}
