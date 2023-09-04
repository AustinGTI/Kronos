import React from 'react'
import {Activity, Day, SegmentType, Session} from "../../../../globals/types/main";
import {Paragraph, XStack, YStack} from "tamagui";
import {ActivitiesState} from "../../../../globals/redux/reducers/activitiesReducer";
import {useSelector} from "react-redux";
import {AppState} from "../../../../globals/redux/reducers";

interface DayPaneProps {
    day: Day
}

interface SideBarProps {
    date: Date
    sessions: Session[]
}

interface TimelineProps {
    sessions: Session[]
}

interface TimelineSegment {
    size: number // a float between 0 and 1
    type: SegmentType
}

interface TimelineSession {
    from: number // a float between 0 and 1
    to: number // a float between 0 and 1
    activity: Activity
    segments: TimelineSegment[]
}

function SideBar({date, sessions}: SideBarProps) {
    const [day_of_week, day_date, month, year] = React.useMemo(() => {
        return [
            date.toLocaleString('default', {weekday: 'short'}),
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
            <YStack w={'100%'} alignItems={'center'} justifyContent={'center'}>
                <Paragraph>{day_of_week}</Paragraph>
                <Paragraph>{day_date}</Paragraph>
                <Paragraph>{month}</Paragraph>
                <Paragraph>{year}</Paragraph>
            </YStack>
            <YStack w={'100%'} flexGrow={1} alignItems={'center'} justifyContent={'flex-end'}>
                <YStack>
                    <Paragraph>No. of Sessions</Paragraph>
                    <Paragraph>{no_of_sessions}</Paragraph>
                </YStack>
                <YStack>
                    <Paragraph>Hours Focused</Paragraph>
                    <Paragraph>{total_session_duration_in_hours}</Paragraph>
                </YStack>
            </YStack>
        </YStack>
    )
}

function Timeline({sessions}: TimelineProps) {
    const activities = useSelector((state: AppState) => state.activities)
    // convert sessions to timeline sessions
    const timeline_sessions = React.useMemo(() => {
        const timeline_sessions: TimelineSession[] = []
        for (const session of sessions) {
            // get the start time in terms of a float between 0 and 1
            const start_of_day = new Date(session.start_time)
            start_of_day.setHours(0, 0, 0, 0)
            const from = (new Date(session.start_time).getTime() - start_of_day.getTime()) / (24 * 60 * 60 * 1000)
            const to = Math.min(1, (new Date(session.end_time ?? new Date()).getTime() - start_of_day.getTime()) / (24 * 60 * 60 * 1000))
            const timeline_session: TimelineSession = {
                from, to,
                activity: activities[session.activity_id],
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
    return (
        <YStack w={'80%'} h={'100%'}>
        </YStack>
    )
}


export default function DayPane({day}: DayPaneProps) {
    return (
        <XStack w={'100%'} h={'100%'}>
            <SideBar date={day.date} sessions={Object.values(day.sessions)}/>
        </XStack>
    )
}