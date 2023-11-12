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
})
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
})

const bodyFont = createInterFont()

const common_theme  = {
    backgroundPress: 'transparent'
}

const config = createTamagui({
    animations,
    defaultTheme: 'dark',
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
            error: '#ff0000',
            color: '#e9bcff',
            active_color: '#a900fe',
            shadowColor: '#7b00b8',
        },
        light: {
            ...themes.light,
            ...common_theme,
            background: '#f0d2ff',
            foreground: '#fff',
            border: '#aaa',
            error: '#ff0000',
            color: '#3d005b',
            active_color: '#a900fe',
            shadowColor: '#6b00a1'
        }
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
