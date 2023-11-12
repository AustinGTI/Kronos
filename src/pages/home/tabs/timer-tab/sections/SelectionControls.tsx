import React from 'react'
import {Activity, Duration} from "../../../../../globals/types/main";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import {KronosPageContext, ModalType} from "../../../../../globals/components/wrappers/KronosPage";
import {Paragraph, XStack, YStack} from "tamagui";
import SelectActivityModal from "../modals/SelectActivityModal";
import SelectDurationModal from "../modals/SelectDurationModal";
import {TimerStatus} from "../useTimer";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";

interface SelectionControlsProps {
    timer_status: TimerStatus
    timer_activity: Activity | null
    setTimerActivity: (activity: Activity | null) => void
    timer_duration: Duration | null,
    setTimerDuration: (duration: Duration | null) => void
}

export default function SelectionControls({timer_status,setTimerActivity, setTimerDuration, timer_activity, timer_duration}: SelectionControlsProps) {
    const {modal_props:{openModal}} = React.useContext(KronosPageContext)

    const openSelectActivityModal = React.useCallback(() => {
        openModal({
            type: ModalType.SHEET,
            component: SelectActivityModal,
            component_props: {
                current_activity: timer_activity,
                setCurrentActivity: setTimerActivity,
                setCurrentDuration: setTimerDuration,
            }
        })
    }, [openModal, timer_activity, setTimerActivity, setTimerDuration]);

    const openSelectDurationModal = React.useCallback(() => {
        openModal({
            type: ModalType.SHEET,
            component: SelectDurationModal,
            component_props: {
                current_duration: timer_duration,
                setCurrentDuration: setTimerDuration,
            }
        })
    }, [openModal, setTimerDuration, timer_duration]);

    return (
        <KronosContainer w={'90%'} paddingVertical={5}>
            {/* all buttons are disabled if the timer is running */}
            <YStack w={'100%'}>
                <XStack w={'100%'} paddingVertical={10} justifyContent={'center'}>
                    {/* if there is an activity selected, display its name, else display 'Select Activity...' */}
                    <KronosButton
                        label={timer_activity ? timer_activity.name : 'Select Activity...'}
                        onPress={openSelectActivityModal} disabled={timer_status !== TimerStatus.OFF}/>
                </XStack>
                <XStack w={'100%'} paddingVertical={10} justifyContent={'center'}>
                    {/* if there is a duration selected, display its name, else display 'Select Duration...' */}
                    <KronosButton
                        label={timer_duration ? timer_duration.name : 'Select Duration...'}
                        onPress={openSelectDurationModal} disabled={timer_status !== TimerStatus.OFF}/>
                </XStack>
            </YStack>
        </KronosContainer>
    );
}
