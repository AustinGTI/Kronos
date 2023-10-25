import React from 'react'
import {useSelector} from "react-redux";
import {AppState} from "../../../redux/reducers";
import {Duration} from "../../../types/main";
import {Adapt, Button, Dialog, DialogOverlay, Paragraph, ScrollView, Sheet, XStack, YStack} from "tamagui";
import DialogContainer from "../DialogContainer";
import {ChevronDown, ChevronUp} from "@tamagui/lucide-icons";

interface DurationPickerPaneProps {
    duration: Duration,
    onClick: () => void,
    is_active: boolean
}

interface DurationPickerProps {
    active_duration_id?: number
    setDuration: (duration: Duration) => void
}

function DurationPickerPane({duration, onClick, is_active}: DurationPickerPaneProps) {
    return (
        <XStack justifyContent={'space-between'} alignItems={'center'}
                marginVertical={5} padding={10} backgroundColor={'$background'}
                borderRadius={10} borderColor={'$color'} width={'95%'}>
            <Paragraph color={'$color'} textDecorationLine={is_active ? 'underline' : 'none'}>{duration.name}</Paragraph>
            <Button onPress={onClick}>Select</Button>
        </XStack>
    )
}

export default function DurationPicker({active_duration_id, setDuration}: DurationPickerProps) {
    const durations = useSelector((state: AppState) => state.durations)
    const [dialog_open, setDialogOpen] = React.useState(false)

    const selected_duration = React.useMemo(() => (
        active_duration_id !== undefined && durations[active_duration_id] ? durations[active_duration_id] : null
    ), [active_duration_id, durations])

    const handleClickDuration = React.useCallback((duration: Duration) => {
        setDuration(duration)
        setDialogOpen(false)
    }, [setDuration])

    return (
        <React.Fragment>
            <XStack paddingVertical={20} alignItems={'center'} justifyContent={'space-between'} onPress={() => setDialogOpen(!dialog_open)}>
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
