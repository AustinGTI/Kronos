import React from 'react'
import {Activity, Session} from "../../../../../globals/types/main";
import {Paragraph, View, XStack, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";

interface SessionViewModalProps {
    session: Session | null
}

export default function SessionViewModal({session}: SessionViewModalProps) {
    const activities = useSelector((state: AppState) => state.activities)
    const session_activity: Activity | null = React.useMemo(() => {
        if (!session) return null
        return activities[session.activity_id]
    }, [activities, session])

    const time_range_string: string | null = React.useMemo(() => {
        if (!session) return null
        const start_time = new Date(session.start_time)
        const end_time = session.end_time ? new Date(session.end_time) : null
        const start_time_string = `${start_time.getHours()}:${start_time.getMinutes()}`
        const end_time_string = end_time ? `${end_time.getHours()}:${end_time.getMinutes()}` : 'Now'
        return `${start_time_string} - ${end_time_string}`
    }, [session])

    if (!session) return null
    return (
        <YStack w={'100%'}>
            <XStack w={"95%"} alignItems={'center'} justifyContent={'space-between'}>
                <View w={25} h={25} backgroundColor={session_activity?.color ?? '#ddd'} borderRadius={5}/>
                <Paragraph>{session_activity?.name ?? 'Custom Activity'}</Paragraph>
                <Paragraph> {time_range_string} </Paragraph>
            </XStack>
        </YStack>
    )
}
