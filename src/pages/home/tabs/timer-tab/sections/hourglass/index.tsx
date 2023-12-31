import React from 'react'
import {
    Box,
    Canvas, FractalNoise,
    Group,
    LinearGradient,
    Path, Shadow, vec,
} from "@shopify/react-native-skia";
import {TimerStatus} from "../../useTimer";
import {TimerSegment} from "../../timer_state";
import {View} from "react-native";
import Animated from 'react-native-reanimated'
import {SegmentTypes} from "../../../../../../globals/types/main";
import {ContainerDimensions} from "../../../../../../globals/types/ui";
import useHourGlassRender from "./hooks/useHourGlassRender";
import {HOUR_GLASS_PROPERTIES} from "./constants";
import useHourGlassTexture from "./hooks/useHourGlassTexture";
import {useTheme} from "tamagui";
import chroma from "chroma-js";

interface HourGlassProps {
    timer_status: TimerStatus
    active_segment: TimerSegment | null
    completed_segments: TimerSegment[]
    remaining_segments: TimerSegment[]
    canvas_height_as_ptg?: number
    canvas_width_as_ptg?: number
}


function generateTestSegment(type: 'focus' | 'break', initial_duration: number, elapsed_duration: number): TimerSegment {
    return {
        key: `${type}-${Math.random()}`,
        initial_duration,
        elapsed_duration,
        segment_type: SegmentTypes[type.toUpperCase() as 'FOCUS' | 'BREAK'],
        on_complete_alert_props: {is_open: false, title: 'nan', description: 'who cares'}
    }
}

export default function HourGlassAnimation({
                                               active_segment,
                                               completed_segments,
                                               remaining_segments,
                                               timer_status,
                                               canvas_height_as_ptg = 60,
                                               canvas_width_as_ptg = 100
                                           }: HourGlassProps) {
    // ! TEST DATA
    // const active_segment: TimerSegment = generateTestSegment('focus', 60, 30)
    //
    // const completed_segments: TimerSegment[] = ([['focus', 60, 60], ['break', 60, 60]] as ['focus' | 'break',number,number][]).map(([type, initial_duration, elapsed_duration]) => generateTestSegment(type, initial_duration, elapsed_duration))
    // const remaining_segments: TimerSegment[] = ([['focus', 60, 0], ['break', 60, 0]] as ['focus' | 'break',number,number][]).map(([type, initial_duration, elapsed_duration]) => generateTestSegment(type, initial_duration, elapsed_duration))
    //
    // const timer_status = TimerStatus.RUNNING

    const [container_dimensions, setContainerDimensions] = React.useState<ContainerDimensions>({width: 0, height: 0})

    // Region COORD CALLBACKS
    // ? ........................

    const coordY = React.useCallback((ptg: number): number => {
        // convert a percentage value to the accurate y coordinate within the canvas using the container dimensions
        return container_dimensions.height * ptg / 100
    }, [container_dimensions.height]);

    const coordX = React.useCallback((ptg: number) => {
        // convert a percentage value to the accurate x coordinate within the canvas using the container dimensions
        return container_dimensions.width * ptg / 100
    }, [container_dimensions.width]);

    // ? ........................
    // End ........................

    const {
        container_path,
        top_sand_path,
        bottom_sand_path,
        falling_sand_path
    } = useHourGlassRender(timer_status, {active_segment, remaining_segments, completed_segments}, {
        x: coordX,
        y: coordY
    })

    const {
        top_sand_gradient,
        bottom_sand_gradient
    } = useHourGlassTexture(top_sand_path, bottom_sand_path, {active_segment, remaining_segments, completed_segments})

    const {
        foreground: {val: foreground},
        // background: {val: background},
        // color: {val: color},
        // borderColor: {val: borderColor},
        shadowColor: {val: shadowColor}
    } = useTheme()

    // console.log('at the moment there are', completed_segments.length, 'completed segments', remaining_segments.length, 'remaining segments')


    return (
        <View
            style={{width: `${canvas_width_as_ptg}%`, height: `${canvas_height_as_ptg}%`}}
            onLayout={(event) => setContainerDimensions({
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height
            })}>
            <Canvas style={{width: '100%', height: '100%'}}>
                <Group>
                    <Path
                        path={container_path}
                        style="fill"
                        color={foreground || 'white'}
                        strokeCap="round">
                        <Shadow dx={0} dy={0} blur={10} color={chroma(shadowColor).alpha(0.3).hex()}/>
                    </Path>
                    <Path
                        path={top_sand_path}
                        style="fill"
                        color={foreground}
                        strokeCap="round">
                        <LinearGradient
                            start={top_sand_gradient.start}
                            end={top_sand_gradient.end}
                            positions={top_sand_gradient.positions}
                            // the first and last segment have one color, the middle segments have two colors, active is the last segment
                            colors={
                                [...remaining_segments, ...(active_segment ? [active_segment] : [])]
                                    .reduce((colors, segment, index) => {
                                        const color = segment.segment_type.color
                                        colors.push(color)
                                        colors.push(color)
                                        return colors
                                    }, [] as string[])}
                        />
                    </Path>

                    {
                        (remaining_segments.length || active_segment) ?
                            <Path path={falling_sand_path}
                                  style="fill"
                                  color={active_segment ? active_segment.segment_type.color : remaining_segments.length ? remaining_segments[remaining_segments.length - 1].segment_type.color : 'black'}
                                  strokeCap="round"/>
                            : null
                    }

                    <Path path={bottom_sand_path}
                          style="fill"
                          color={foreground}
                          strokeCap="round">
                        <LinearGradient
                            start={bottom_sand_gradient.start}
                            end={bottom_sand_gradient.end}
                            positions={bottom_sand_gradient.positions}
                            colors={
                                [...(active_segment ? [active_segment] : []), ...completed_segments.slice().reverse()]
                                    .reduce((colors, segment, index) => {
                                        const color = segment.segment_type.color
                                        colors.push(color)
                                        colors.push(color)
                                        return colors
                                    }, [] as string[])}
                        />
                    </Path>

                    {/*<Path*/}
                    {/*    path={container_path}*/}
                    {/*    style="stroke"*/}
                    {/*    strokeWidth={HOUR_GLASS_PROPERTIES.container_thickness}*/}
                    {/*    color={color}*/}
                    {/*    strokeCap="round"*/}
                    {/*/>*/}
                </Group>
            </Canvas>
        </View>
    );
}
