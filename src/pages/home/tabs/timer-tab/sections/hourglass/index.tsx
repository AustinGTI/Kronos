import React from 'react'
import {
    Box,
    Canvas,
    Group,
    LinearGradient,
    Path,
    rect,
    Rect,
    rrect,
    Skia,
    SkPoint,
    vec
} from "@shopify/react-native-skia";
import {TimerStatus} from "../../useTimer";
import {TimerSegment} from "../../timer_state";
import {Animated, View} from "react-native";
import {
    bezierCurve, pt, subdivideBezierCurve,
    xyToPt
} from "../../../../../../globals/helpers/math_functions";
import {number} from "yup";
import {SegmentTypes} from "../../../../../../globals/types/main";
import {ContainerDimensions} from "../../../../../../globals/types/ui";
import {calculateSegmentGroupDurations} from "./helpers";
import useHourGlassRender from "./hooks/useHourGlassRender";
import {HOUR_GLASS_PROPERTIES} from "./constants";
import useHourGlassTexture from "./hooks/useHourGlassTexture";
import useAnimatedValue from "../../../../../../globals/hooks/useAnimatedValue";

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

    const [container_dimensions, setContainerDimensions] = React.useState<ContainerDimensions>({width: 0, height: 0})

    const {
        container_path,
        top_sand_path,
        bottom_sand_path,
        falling_sand_path
    } = useHourGlassRender(timer_status,container_dimensions, {active_segment, remaining_segments, completed_segments})

    const {
        top_sand_gradient,
        bottom_sand_gradient
    } = useHourGlassTexture({
        top_sand_bounds: top_sand_path.getBounds(),
        bottom_sand_bounds: bottom_sand_path.getBounds()
    }, {active_segment, remaining_segments, completed_segments})


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
                        color={'white'}
                        strokeCap="round"
                    />
                    <Path
                        path={top_sand_path}
                        style="fill"
                        color={'red'}
                        strokeCap="round">
                        <LinearGradient
                            start={top_sand_gradient.start}
                            end={top_sand_gradient.end}
                            colors={top_sand_gradient.colors}
                            positions={top_sand_gradient.positions}
                        />
                    </Path>

                    <Path path={falling_sand_path}
                          style="fill"
                          color={top_sand_gradient.colors[top_sand_gradient.colors.length - 1]}
                          strokeCap="round"/>
                    {/*<Box box={rrect(rect())}/>*/}

                    <Path path={bottom_sand_path}
                          style="fill"
                          color={'purple'}
                          strokeCap="round">
                        <LinearGradient
                            start={bottom_sand_gradient.start}
                            end={bottom_sand_gradient.end}
                            colors={bottom_sand_gradient.colors}
                            positions={bottom_sand_gradient.positions}
                        />
                    </Path>

                    <Path
                        path={container_path}
                        style="stroke"
                        strokeWidth={HOUR_GLASS_PROPERTIES.container_thickness}
                        color={'black'}
                        strokeCap="round"
                    />
                </Group>
            </Canvas>
        </View>
    );
}