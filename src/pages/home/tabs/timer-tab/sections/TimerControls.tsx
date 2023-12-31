import React from 'react'
import {XStack} from "tamagui";
import {TimerStatus} from "../useTimer";
import {Pause, Play, Square} from "@tamagui/lucide-icons";
import {IconProps} from "@tamagui/helpers-icon";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";


interface TimerControlsProps {
    timer_ready: boolean
    timer_status: TimerStatus
    startTimer: () => void
    stopTimer: () => void
    pauseTimer: () => void
    resumeTimer: () => void
}

interface ControlButtonProps {
    icon: React.ComponentType<IconProps>,
    onClick: () => void,
    disabled?: boolean
}


function ControlButton({icon, onClick, disabled}: ControlButtonProps) {
    return (
        <KronosContainer w={50} h={50} padding={0} borderRadius={25}>
            <KronosButton onPress={onClick} icon={icon} disabled={disabled} w={'100%'} h={'100%'}/>
        </KronosContainer>
    )
}


export default function TimerControls({
                                          timer_ready,
                                          timer_status,
                                          startTimer,
                                          stopTimer,
                                          pauseTimer,
                                          resumeTimer
                                      }: TimerControlsProps) {
    // check for a situation where the timer_status is not OFF yet the timer is not ready, this should never happen, if it does throw an error
    if (timer_status !== TimerStatus.OFF && !timer_ready) {
        throw new Error('Timer is not ready but timer status is ON')
    }
    return (
        <XStack w={'100%'} justifyContent={'center'} paddingBottom={2}>
            {/* if the timer status is OFF, show a play button with startTimer onClick */}
            {(timer_status === TimerStatus.OFF || timer_status === TimerStatus.DONE) &&
                <ControlButton icon={Play} onClick={startTimer} disabled={!timer_ready}/>}
            {/* if the timer status is PAUSED show a play button and a stop button */}
            {timer_status === TimerStatus.PAUSED && (
                <React.Fragment>
                    <ControlButton icon={Play} onClick={resumeTimer}/>
                    <ControlButton icon={Square} onClick={stopTimer}/>
                </React.Fragment>
            )}
            {/* if the timer status is RUNNING show a pause button */}
            {timer_status === TimerStatus.RUNNING && <ControlButton icon={Pause} onClick={pauseTimer}/>}
        </XStack>
    );
}
