import React from 'react'
import {useSelector} from "react-redux";
import {AppState} from "../../../redux/reducers";
import {Duration} from "../../../types/main";
import {Adapt, Button, Dialog, DialogOverlay, Paragraph, ScrollView, Sheet, XStack, YStack} from "tamagui";
import DialogContainer from "../DialogContainer";

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
                marginVertical={5} paddingHorizontal={10}
                borderRadius={5} borderWidth={is_active ? 2 : 0} borderColor={'black'}>
            <Paragraph>{duration.name}</Paragraph>
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
            <XStack paddingVertical={10} alignItems={'center'} justifyContent={'space-between'}>
                <Paragraph width={'60%'}>
                    {selected_duration?.name ?? 'Select a duration...'}
                </Paragraph>
                <Button onPress={() => setDialogOpen(true)}>Select</Button>
            </XStack>
            {dialog_open &&
                <DialogContainer onClose={() => setDialogOpen(false)}>
                    <YStack width={'100%'}>
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
