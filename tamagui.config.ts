import {createAnimations} from '@tamagui/animations-react-native'
import {createInterFont} from "@tamagui/font-inter";
import {createMedia} from '@tamagui/react-native-media-driver'
import {shorthands} from '@tamagui/shorthands'
import {themes, tokens} from '@tamagui/themes'
import {createFont, createTamagui} from 'tamagui'

const animations = createAnimations({
    bouncy: {
        type: 'spring',
        damping: 10,
        mass: 0.9,
        stiffness: 100,
    },
    lazy: {
        type: 'spring',
        damping: 20,
        stiffness: 60,
    },
    quick: {
        type: 'spring',
        damping: 20,
        mass: 1.2,
        stiffness: 250,
    },
    fast: {
        type: 'timing',
        duration: 200,
        easing: (t: number) => {
            // Adjust the values of these constants to control the curve
            const k = 10; // Controls the steepness of the curve
            const midPoint = 0.5; // The midpoint of the curve (0 to 1)

            // Apply the sigmoid formula to interpolate the value
            return 1 / (1 + Math.exp(-k * (t - midPoint)));
        }
    }
})

// region FONTS
// ? ........................

const headingFont = createInterFont()

const alatsiFont = createFont({
    family: 'Alatsi',
    size: {
        1: 11,
        2: 14,
        3: 32,
        4: 48,
        true: 14,
    },
    lineHeight: {
        // 1 will be 22
        1: 22,
        2: 24,
        3: 42,
        4: 56,
        true: 24,
    },
    weight: {
        1: '300',
        // 2 will be 300
        3: '600',
    },
    letterSpacing: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
    },
})

const rubikFont = createFont({
        family: 'Rubik',
        size: {
            1: 11,
            2: 14,
            3: 32,
            4: 48,
            true: 14,
        },
        lineHeight: {
            // 1 will be 22
            1: 22,
            2: 24,
            3: 42,
            4: 56,
            true: 24,
        },
        weight: {
            1: '500',
            2: '600',
            3: '800',
            true: '500',
        },
        letterSpacing: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
        },
    }
)
// ? ........................
// endregion ........................


// region THEMING
// ? ........................

const common_theme = {
    pause_color: '#999',
    backgroundPress: 'transparent',
    error: '#f00'
}


export enum KronosTheme {
    POMODORO_PURPLE = 'pomodoro_purple',
    CHRONOGRAPH_CHERRY = 'chronograph_cherry',
    HOURGLASS_HAZEL = 'hourglass_hazel',
    TEMPORAL_TEAL = 'temporal_teal',
    OCLOCK_ONYX = 'oclock_onyx',
}

export const DARK_THEMES = [
    'dark',
    KronosTheme.TEMPORAL_TEAL,
    KronosTheme.OCLOCK_ONYX,
]

// ? ........................
// endregion ........................


const config = createTamagui({
    animations,
    defaultTheme: KronosTheme.POMODORO_PURPLE,
    shouldAddPrefersColorThemes: false,
    themeClassNameOnRoot: false,
    shorthands,
    fonts: {
        heading: rubikFont,
        body: rubikFont,
    },
    themes: {
        ...themes,
        dark: {
            ...themes.dark,
            ...common_theme,
            background: '#1c002a',
            foreground: '#000',
            border: '#fff',
            color: '#e9bcff',
            active_color: '#a900fe',
            shadowColor: '#7b00b8',
            focus_color: '#db9cff',
            break_color: '#ffe169',
        },
        light: {
            ...themes.light,
            ...common_theme,
            background: '#f0d2ff',
            foreground: '#fff',
            border: '#aaa',
            color: '#3d005b',
            active_color: '#a900fe',
            shadowColor: '#6b00a1',
            focus_color: '#db9cff',
            break_color: '#ffe169',
        },
        [KronosTheme.POMODORO_PURPLE]: {
            ...themes.light,
            ...common_theme,
            background: '#f0d2ff',
            foreground: '#fff',
            border: '#aaa',
            color: '#3d005b',
            active_color: '#a900fe',
            shadowColor: '#6b00a1',
            focus_color: '#db9cff',
            break_color: '#ffe169',
        },
        [KronosTheme.CHRONOGRAPH_CHERRY]: {
            ...themes.light,
            ...common_theme,
            background: '#ff7d7d',
            foreground: '#fff',
            border: '#aaa',
            color: '#570000',
            active_color: '#ef0000',
            shadowColor: '#d40000',
            focus_color: '#fda1e7',
            break_color: '#fff4c9'
        },
        [KronosTheme.HOURGLASS_HAZEL]: {
            ...themes.light,
            ...common_theme,
            background: '#feed95',
            foreground: '#fff',
            border: '#aaa',
            color: '#524000',
            active_color: '#ffb800',
            shadowColor: '#654f00',
            focus_color: '#ffd9f5',
            break_color: '#ffc796'
        },
        [KronosTheme.TEMPORAL_TEAL]: {
            ...themes.dark,
            ...common_theme,
            background: '#174e57',
            foreground: '#002C34',
            border: '#fff',
            color: '#b7f4ff',
            active_color: '#00d9ff',
            shadowColor: '#000',
            focus_color: '#8f75b1',
            break_color: '#d6c88a'
        },
        [KronosTheme.OCLOCK_ONYX]: {
            ...themes.dark,
            ...common_theme,
            background: '#0f0f0f',
            foreground: '#1d1d1d',
            border: '#fff',
            color: '#b5b5b5',
            active_color: '#fff',
            shadowColor: '#000',
            focus_color: '#301934',
            break_color: '#6b5d0a'
        },
    },
    tokens: {
        ...tokens,
        text: {
            small: 12,
            normal: 14,
            heading: 17
        },
    },
    media: createMedia({
        xs: {maxWidth: 660},
        sm: {maxWidth: 800},
        md: {maxWidth: 1020},
        lg: {maxWidth: 1280},
        xl: {maxWidth: 1420},
        xxl: {maxWidth: 1600},
        gtXs: {minWidth: 660 + 1},
        gtSm: {minWidth: 800 + 1},
        gtMd: {minWidth: 1020 + 1},
        gtLg: {minWidth: 1280 + 1},
        short: {maxHeight: 820},
        tall: {minHeight: 820},
        hoverNone: {hover: 'none'},
        pointerCoarse: {pointer: 'coarse'},
    }),

})
export type AppConfig = typeof config

declare module 'tamagui' {
    // overrides TamaguiCustomConfig so your custom types
    // work everywhere you import `tamagui`
    interface TamaguiCustomConfig extends AppConfig {
    }
}
export default config
