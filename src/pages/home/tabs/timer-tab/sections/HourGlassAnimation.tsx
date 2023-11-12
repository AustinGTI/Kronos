import React from 'react'
import {Canvas, Group, Path, Skia, SkiaDomView, SkiaView} from "@shopify/react-native-skia";
import {TimerStatus} from "../useTimer";
import {TimerSegment} from "../timer_state";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import {View} from "react-native";
import {KRONOS_PAGE_PADDING} from "../../../../../globals/components/wrappers/KronosPage";
import {number} from "yup";

interface HourGlassProps {
    timer_status: TimerStatus
    active_segment: TimerSegment | null
    completed_segments: TimerSegment[]
    remaining_segments: TimerSegment[]
    canvas_height_as_ptg?: number
    canvas_width_as_ptg?: number
}

interface ContainerDimensions {
    width: number
    height: number
}


export default function HourGlassAnimation({
                                               active_segment,
                                               completed_segments,
                                               remaining_segments,
                                               timer_status,
                                               canvas_height_as_ptg = 60,
                                               canvas_width_as_ptg = 100
                                           }: HourGlassProps) {
    const [container_dimensions, setContainerDimensions] = React.useState<ContainerDimensions>({width: 0, height: 0})

    const coordY = React.useCallback((ptg: number): number => {
        // convert a percentage value to the accurate y coordinate within the canvas using the container dimensions
        return container_dimensions.height * ptg / 100
    }, [container_dimensions.height]);

    const coordX = React.useCallback((ptg: number) => {
        // convert a percentage value to the accurate x coordinate within the canvas using the container dimensions
        return container_dimensions.width * ptg / 100
    }, [container_dimensions.width]);

    const hour_glass_shape = React.useCallback((ux: number, uy: number, vx: number, vy: number, u_curve: number, v_curve: number) => {
        // use skia to create a rounded hour glass shape
        const path = Skia.Path.Make()
        // top left
        path.moveTo(coordX(ux), coordY(uy))
        path.cubicTo(coordX(ux), coordY(uy+u_curve), coordX(vx), coordY(vy-v_curve), coordX(vx), coordY(vy))
        // bottom left
        path.moveTo(coordX(ux), coordY(100-uy))
        path.cubicTo(coordX(ux), coordY(100-(uy+u_curve)), coordX(vx), coordY(100-(vy-v_curve)), coordX(vx), coordY(100-vy))
        // top right
        path.moveTo(coordX(100-ux), coordY(uy))
        path.cubicTo(coordX(100-ux), coordY(uy+u_curve), coordX(100-vx), coordY(vy-v_curve), coordX(100-vx), coordY(vy))
        // bottom right
        path.moveTo(coordX(100-ux), coordY(100-uy))
        path.cubicTo(coordX(100-ux), coordY(100-(uy+u_curve)), coordX(100-vx), coordY(100-(vy-v_curve)), coordX(100-vx), coordY(100-vy))

        return path
    }, [coordX, coordY]);

    return (
        <View
            style={{width: `${canvas_width_as_ptg}%`, height: `${canvas_height_as_ptg}%`}}
            onLayout={(event) => setContainerDimensions({
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height
            })}>
            <Canvas style={{width: '100%', height: '100%', backgroundColor: 'pink'}}>
                <Group>
                    <Path
                        path={hour_glass_shape(20,10,45,50,30,10)}
                        style="stroke"
                        strokeWidth={10}
                        color={'black'}
                        strokeCap="round"
                    />
                </Group>
            </Canvas>
        </View>
    );
}
