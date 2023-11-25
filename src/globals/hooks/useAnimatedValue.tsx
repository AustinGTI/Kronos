import React from 'react'
import {boolean, number} from "yup";

const ANIMATION_SPEED_IN_MS = 1000 / 30 // 30 fps

interface AnimatedValueProps {
    value: number
    increment: number
    stop_at?: number
}

interface AnimatedValueControls {
    animated_value: number
    play: () => void
    pause: () => void
}

/**
 * A hook that takes in a scalar value and an increment value and returns an animated value that increments by the increment value every ANIMATION_SPEED_IN_MS milliseconds
 */
export default function useAnimatedValue({value,increment,stop_at}:AnimatedValueProps): AnimatedValueControls {
    const [is_playing, setIsPlaying] = React.useState<boolean>(false)

    const [animated_value, setAnimatedValue] = React.useState<number>(value)
    const [tick, setTick] = React.useState<boolean>(false)

    React.useEffect(() => {
        // if stop_at exists and the animated value is further from the initial value than the stop_at value, set the animated value to the stop_at value and stop the animation
        if (stop_at && Math.abs(animated_value - value) > Math.abs(stop_at - value)) {
            setIsPlaying(false)
            // reset the animated value to the initial value
            setAnimatedValue(value)
        }
    }, []);

    // if is_playing is set to true, set tick to true
    React.useEffect(() => {
        if (is_playing) {
            setTick(true)
        }
    }, [is_playing]);

    // if tick is true, increment the animated value by the increment value ,
    // set tick to false, and set a timeout to set tick to true after ANIMATION_SPEED_IN_MS milliseconds unless is_playing is false
    React.useEffect(() => {
        if (tick) {
            setAnimatedValue(animated_value + increment)
            setTick(false)
            setTimeout(() => {
                if (is_playing) {
                    setTick(true)
                }
            }, ANIMATION_SPEED_IN_MS)
        }
    }, [tick]);

    return {
        animated_value,
        play: () => setIsPlaying(true),
        pause: () => setIsPlaying(false),
    }
}
