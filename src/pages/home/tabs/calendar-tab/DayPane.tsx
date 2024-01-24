import React, {useCallback, useRef} from 'react'
import {Activity, Day, SegmentType, Session, UNTITLED_ACTIVITY} from "../../../../globals/types/main";
import {Paragraph, useTheme, View, XStack, XStackProps, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {AppState} from "../../../../globals/redux/reducers";
import {LayoutChangeEvent, NativeSyntheticEvent, TextLayoutEventData, TouchableOpacity} from "react-native";
import {CalendarTabContext} from "./context";
import {dateToDDMMYYYY} from "../../../../globals/helpers/datetime_functions";
import {KronosPageContext, ModalType} from "../../../../globals/components/wrappers/KronosPage";
import SessionViewModal from "./modals/SessionViewModal";
import {number} from "yup";
import {Canvas, DiffRect, rect, rrect} from "@shopify/react-native-skia";

interface Dimensions {
    width: number
    height: number
}

interface DayPaneProps {
    day: Day
}

interface TimelineProps {
    sessions: {
        [id: number]: Session
    }
}

interface TimelineMarkerProps extends XStackProps {
    hour: number // the hour of the day between 0 and 23
}

interface DailyTimelineProps {
    calendar_height: number
}

interface TimelineSessionWindowProps {
    calendar_height: number
    timeline_session: TimelineSession
    showSessionDetailsInModal: (timeline_session: TimelineSession) => void
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
    session_duration: number // in minutes
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
            <Paragraph fontSize={10} lineHeight={10} color={'$color'} paddingRight={5}>{hour_string}</Paragraph>
            <View flexGrow={1} h={1} borderTopColor={'$color'} borderTopWidth={1}/>
        </XStack>
    )
}

function DailyTimeline({calendar_height}: DailyTimelineProps) {
    return (
        // add timeline markers for every 2nd hour from 0 to 23
        <React.Fragment>
            {
                [...Array(24).keys()].filter(hour => hour % 2).map((hour) => {
                    const top = (hour / 24 * calendar_height - 5)
                    return (
                        <TimelineMarker
                            key={hour} hour={hour}
                            paddingRight={5} w={'100%'}
                            zIndex={-1} top={top} position={'absolute'} h={10}/>
                    )
                })
            }
        </React.Fragment>
    )
}

function TimelineSessionWindow
({timeline_session, calendar_height, showSessionDetailsInModal}: TimelineSessionWindowProps) {
    const [text_dimensions, setTextDimensions] = React.useState<Dimensions>({width: 0, height: 0})

    const onParagraphTextLayout = useCallback((event: NativeSyntheticEvent<TextLayoutEventData>) => {
        const {width, height} = event.nativeEvent.lines[0]
        setTextDimensions({width, height})
    }, [setTextDimensions]);

    const window_height: number = React.useMemo(() => {
        return (timeline_session.to - timeline_session.from) * calendar_height
    }, [timeline_session.to, timeline_session.from, calendar_height]);

    return (
        <View paddingLeft={30} paddingRight={10}
              position={'absolute'} w={"100%"} top={timeline_session.from * calendar_height}
              height={window_height}>
            <TouchableOpacity
                onPressIn={() => showSessionDetailsInModal(timeline_session)}>
                <View
                    w={'100%'} h={'100%'}
                    backgroundColor={timeline_session.activity.color}
                    opacity={0.8}
                    borderRadius={5}>
                    {
                        text_dimensions.height < window_height &&
                        <Paragraph
                            opacity={1}
                            fontSize={12} textTransform={'uppercase'}
                            paddingVertical={0} paddingHorizontal={5} onTextLayout={onParagraphTextLayout}>
                            {timeline_session.activity.name}
                        </Paragraph>
                    }
                </View>
            </TouchableOpacity>
        </View>
    );
}


function Timeline({sessions}: TimelineProps) {
    const {
        dimensions_data: {calendar_height},
    } = React.useContext(CalendarTabContext)

    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

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
            const total_segments_duration = session.segments.reduce((total, segment) => total + segment.duration, 0)
            const timeline_session: TimelineSession = {
                id: session.id,
                from, to,
                activity: activities[session.activity_id] ?? UNTITLED_ACTIVITY,
                segments: [],
                session_duration: total_segments_duration
            }
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
        // setSessionInModal(session)
        // setModalVisibility(true)
        openModal({
            type: ModalType.SHEET,
            component: SessionViewModal,
            component_props: {
                session
            },
            modal_props: {
                height: 50,
                // scrollable: false
            }
        })
    }, [sessions, openModal])

    const {
        foreground: {val: foreground}
    } = useTheme()

    return (
        <YStack position={'relative'} flexGrow={1} h={'100%'} alignItems={'center'} backgroundColor={foreground}>
            {
                timeline_sessions.map((timeline_session) => {
                        return <TimelineSessionWindow
                            key={timeline_session.id}
                            calendar_height={calendar_height} timeline_session={timeline_session}
                            showSessionDetailsInModal={showSessionDetailsInModal}/>
                    }
                )
            }
            <DailyTimeline calendar_height={calendar_height}/>
        </YStack>
    )
}


export default function DayPane({day}: DayPaneProps) {
    const {
        dimensions_data: {calendar_height},
        date_data: {active_date}
    } = React.useContext(CalendarTabContext)

    const render_page = React.useMemo(() => {
        const yesterday = dateToDDMMYYYY(new Date(active_date.getTime() - 24 * 60 * 60 * 1000))
        const today = dateToDDMMYYYY(active_date)
        const tomorrow = dateToDDMMYYYY(new Date(active_date.getTime() + 24 * 60 * 60 * 1000))

        const date = dateToDDMMYYYY(new Date(day.date_as_iso))

        console.log('current date is', date, 'and the date iso is', day.date_as_iso, 'and the date is ', new Date(day.date_as_iso), 'and the ddmmyyyy is', dateToDDMMYYYY(new Date(day.date_as_iso)), 'and the day is', day)

        return date === yesterday || date === today || date === tomorrow
    }, [active_date, day.date_as_iso])

    return (
        <XStack w={'100%'} h={calendar_height}>
            {render_page ? <React.Fragment>
                {/*<SideBar date_as_iso={new Date(day.date_as_iso)} sessions={Object.values(day.sessions)}/>*/}
                <Timeline sessions={day.sessions}/>
            </React.Fragment> : (
                // <Paragraph>Blank {dateToDDMMYYYY(new Date(day.date_as_iso))}</Paragraph>
                <YStack h={'100%'} w={'100%'}>
                    <DailyTimeline calendar_height={calendar_height}/>
                </YStack>
            )}
        </XStack>
    )
}