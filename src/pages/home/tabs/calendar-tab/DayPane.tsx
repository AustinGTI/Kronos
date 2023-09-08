import React from 'react'
import {Activity, Day, SegmentType, Session} from "../../../../globals/types/main";
import {Paragraph, View, XStack, XStackProps, YStack} from "tamagui";
import {ActivitiesState} from "../../../../globals/redux/reducers/activitiesReducer";
import {useSelector} from "react-redux";
import {AppState} from "../../../../globals/redux/reducers";
import {TouchableOpacity, useWindowDimensions} from "react-native";
import {useHeaderHeight} from "react-native-screens/native-stack";
import {CalendarTabContext} from "./context";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../../globals/helpers/datetime_functions";

interface DayPaneProps {
    date: string
}

interface SideBarProps {
    date: Date
    sessions: Session[]
}

interface TimelineProps {
    sessions: {
        [id: number]: Session
    }
}

interface TimelineMarkerProps extends XStackProps {
    hour: number // the hour of the day between 0 and 23
}

interface TimelineSegment {
    size: number // a float between 0 and 1
    type: SegmentType
}

interface TimelineSession {
    id: number
    from: number // a float between 0 and 1
    to: number // a float between 0 and 1
    activity: Activity
    segments: TimelineSegment[]
}


function SideBar({date, sessions}: SideBarProps) {
    const [day_of_week, day_date, month, year] = React.useMemo(() => {
        return [
            date.toLocaleString('default', {weekday: 'short'}).split(',')[0],
            date.getDate(),
            date.toLocaleString('default', {month: 'short'}),
            date.getFullYear()
        ]
    }, [date])

    const [no_of_sessions, total_session_duration_in_hours] = React.useMemo(() => {
        const no_of_sessions = sessions.length
        const total_session_duration_in_hours = sessions.reduce((total, session) => {
            let duration = 0
            for (const segment of session.segments) {
                duration += segment.duration
            }
            return total + duration
        }, 0)
        return [no_of_sessions, Math.round(total_session_duration_in_hours / 60)]
    }, [sessions])


    return (
        <YStack w={'20%'} h={'100%'}>
            <YStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
                <Paragraph fontSize={22} marginVertical={2} textTransform={'uppercase'}>{day_of_week}</Paragraph>
                <Paragraph fontSize={36} lineHeight={40} marginVertical={2}
                           textTransform={'uppercase'}>{day_date.toString().padStart(2, '0')}</Paragraph>
                <Paragraph fontSize={22} marginVertical={2} textTransform={'uppercase'}>{month}</Paragraph>
                <Paragraph fontSize={19} marginVertical={2} textTransform={'uppercase'}>{year}</Paragraph>
            </YStack>
            <YStack w={'100%'} flexGrow={1} alignItems={'center'} justifyContent={'flex-end'} paddingVertical={5}>
                <YStack alignItems={'center'} justifyContent={'center'} paddingVertical={5}>
                    <Paragraph color={'#555'} textTransform={'uppercase'} fontSize={12}>Sessions</Paragraph>
                    <Paragraph fontSize={36} lineHeight={40}>{no_of_sessions.toString().padStart(2, '0')}</Paragraph>
                </YStack>
                <YStack alignItems={'center'} justifyContent={'center'} paddingVertical={5}>
                    <Paragraph color={'#555'} textTransform={'uppercase'} fontSize={12}>Hours</Paragraph>
                    <Paragraph fontSize={36}
                               lineHeight={40}>{total_session_duration_in_hours.toString().padStart(2, '0')}</Paragraph>
                </YStack>
            </YStack>
        </YStack>
    )
}

function TimelineMarker({hour, ...stack_props}: TimelineMarkerProps) {
    // convert the hour to a 12 hour formatted string
    const hour_string = React.useMemo(() => {
        if (hour === 0) {
            return '12am'
        } else if (hour === 12) {
            return '12pm'
        } else if (hour < 12) {
            return `${hour}am`
        } else {
            return `${hour - 12}pm`
        }
    }, [hour])

    return (
        // the timeline marker is a vertical line with a label to the left
        <XStack alignItems={'center'} {...stack_props}>
            <Paragraph fontSize={10} lineHeight={10} color={'#aaa'} paddingRight={5}>{hour_string}</Paragraph>
            <View flexGrow={1} h={1} backgroundColor={'#aaa'}/>
        </XStack>
    )
}

function Timeline({sessions}: TimelineProps) {
    const {
        dimensions_data: {calendar_height},
        modal_data: {setModalVisibility, setSessionInModal}
    } = React.useContext(CalendarTabContext)

    const activities = useSelector((state: AppState) => state.activities)
    // convert sessions to timeline sessions
    const timeline_sessions = React.useMemo(() => {
        const timeline_sessions: TimelineSession[] = []
        for (const session of Object.values(sessions)) {
            // get the start time in terms of a float between 0 and 1
            const start_of_day = new Date(session.start_time)
            start_of_day.setHours(0, 0, 0, 0)
            const from = (new Date(session.start_time).getTime() - start_of_day.getTime()) / (24 * 60 * 60 * 1000)
            const to = Math.min(1, (new Date(session.end_time ?? new Date()).getTime() - start_of_day.getTime()) / (24 * 60 * 60 * 1000))
            const timeline_session: TimelineSession = {
                id: session.id,
                from, to,
                activity: activities[session.activity_id] ?? {
                    id: '-1', name: 'Custom Activity', color: '#ddd'
                },
                segments: []
            }
            const total_segments_duration = session.segments.reduce((total, segment) => total + segment.duration, 0)
            for (const segment of session.segments) {
                timeline_session.segments.push({
                    size: segment.duration / total_segments_duration,
                    type: segment.type
                })
            }
            timeline_sessions.push(timeline_session)
        }
        return timeline_sessions
    }, [sessions, activities])

    const showSessionDetailsInModal = React.useCallback((timeline_session: TimelineSession) => {
        const session = sessions[timeline_session.id]
        setSessionInModal(session)
        setModalVisibility(true)
    }, [sessions, setSessionInModal, setModalVisibility])

    return (
        <YStack position={'relative'} flexGrow={1} h={'100%'} alignItems={'center'}>
            {
                timeline_sessions.map((timeline_session, index) => {
                        return (
                            <View key={index}
                                  paddingLeft={30} paddingRight={10}
                                  position={'absolute'} w={"100%"} top={timeline_session.from * calendar_height}
                                  height={(timeline_session.to - timeline_session.from) * calendar_height}>
                                <TouchableOpacity
                                    onPress={() => showSessionDetailsInModal(timeline_session)}>
                                    <View
                                        w={'100%'} h={'100%'}
                                        backgroundColor={timeline_session.activity.color}
                                        opacity={0.8}
                                        borderRadius={5}>
                                        <Paragraph fontSize={12} textTransform={'uppercase'}
                                                   paddingVertical={5} paddingHorizontal={10}>
                                            {timeline_session.activity.name}
                                        </Paragraph>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                )
            }
            {
                // add timeline markers for every 2nd hour from 0 to 23
                [...Array(24).keys()].filter(hour => hour % 2).map((hour) => {
                    const top = hour / 24 * calendar_height - 5
                    return (
                        <TimelineMarker
                            key={hour} hour={hour}
                            paddingRight={5} w={'100%'}
                            zIndex={-1} top={top} position={'absolute'} h={10}/>
                    )
                })
            }
        </YStack>
    )
}


export default function DayPane({date}: DayPaneProps) {
    const {
        dimensions_data: {calendar_height}
    } = React.useContext(CalendarTabContext)

    const sessions = useSelector((state: AppState) => state.sessions)

    const day: Day = React.useMemo(() => {
        // if there are no sessions for the day, return a day object with an empty sessions object
        if (!sessions[date]) {
            return {
                date: DDMMYYYYToDate(date).toISOString(),
                sessions: {}
            }
        } else {
            return sessions[date]
        }
    }, [sessions, date])

    console.log('rerendering day pane',dateToDDMMYYYY(new Date(day.date)))
    return (
        <XStack w={'100%'} h={calendar_height}>
            <SideBar date={new Date(day.date)} sessions={Object.values(day.sessions)}/>
            <Timeline sessions={day.sessions}/>
        </XStack>
    )
}