import React from 'react'
import {useTheme} from "tamagui";
import {SegmentColorKey} from "../../types/main";

export type SegmentColors = {
    [key in SegmentColorKey]: string;
};

export default function useSegmentColors(): SegmentColors {
    const {
        focus_color: {val: focus_color},
        break_color: {val: break_color},
        pause_color: {val: pause_color},
    } = useTheme()

    return {
        [SegmentColorKey.FOCUS]: focus_color,
        [SegmentColorKey.BREAK]: break_color,
        [SegmentColorKey.PAUSE]: pause_color,
    };
}
