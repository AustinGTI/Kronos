import React from "react";
import {CalendarTabContext} from "./context";
import {Paragraph, StackProps, YStack} from "tamagui";
import {Day} from "../../../../globals/types/main";
import KronosContainer from "../../../../globals/components/wrappers/KronosContainer";

interface SideBarProps extends StackProps {
    day: Day
}

export default function CalendarSideBar({day, ...stack_props}: SideBarProps) {
    const {
        date_picker_data: {setDatePickerVisibility}
    } = React.useContext(CalendarTabContext)

    const [day_of_week, day_date, month, year] = React.useMemo(() => {
        const date = new Date(day.date_as_iso)
        return [
            date.toLocaleString('default', {weekday: 'short'}).split(',')[0],
            date.getDate(),
            date.toLocaleString('default', {month: 'short'}),
            date.getFullYear()
        ]
    }, [day.date_as_iso])

    const [no_of_sessions, total_session_duration_in_hours] = React.useMemo(() => {
        const day_sessions = Object.values(day.sessions)
        const no_of_sessions = day_sessions.length
        const total_session_duration_in_hours = day_sessions.reduce((total, session) => {
            let duration = 0
            for (const segment of session.segments) {
                duration += segment.duration
            }
            return total + duration
        }, 0)
        return [no_of_sessions, Math.round(total_session_duration_in_hours / 60)]
    }, [day.sessions])

    return (
        <YStack justifyContent={'space-between'} {...stack_props}>
            <KronosContainer w={'100%'} h={'25%'}>
                <YStack
                    onPress={() => setDatePickerVisibility(true)}
                    w={'100%'} h={'100%'} alignItems={'center'} justifyContent={'center'}>
                    <Paragraph fontSize={22} marginVertical={2} textTransform={'uppercase'}>{day_of_week}</Paragraph>
                    <Paragraph fontSize={36} lineHeight={40} marginVertical={2}
                               textTransform={'uppercase'}>{day_date.toString().padStart(2, '0')}</Paragraph>
                    <Paragraph fontSize={22} marginVertical={2} textTransform={'uppercase'}>{month}</Paragraph>
                    <Paragraph fontSize={19} marginVertical={2} textTransform={'uppercase'}>{year}</Paragraph>
                </YStack>
            </KronosContainer>
            <KronosContainer w={'100%'} h={'25%'}>
                <YStack w={'100%'} h={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
                    <YStack alignItems={'center'} justifyContent={'center'} paddingVertical={5}>
                        <Paragraph color={'#555'} textTransform={'uppercase'} fontSize={12}>Sessions</Paragraph>
                        <Paragraph fontSize={36}
                                   lineHeight={40}>{no_of_sessions.toString().padStart(2, '0')}</Paragraph>
                    </YStack>
                    <YStack alignItems={'center'} justifyContent={'center'} paddingVertical={5}>
                        <Paragraph color={'#555'} textTransform={'uppercase'} fontSize={12}>Hours</Paragraph>
                        <Paragraph fontSize={36}
                                   lineHeight={40}>{total_session_duration_in_hours.toString().padStart(2, '0')}</Paragraph>
                    </YStack>
                </YStack>
            </KronosContainer>
        </YStack>
    )
}
