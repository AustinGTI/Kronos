interface AlertButton {
    text: string
    onPress: () => void
}

export interface AlertProps {
    title: string
    description: string
    buttons: AlertButton[]
    with_cancel_button?: boolean
}

export const DEFAULT_ALERT_PROPS: AlertProps = {
    title: '',
    description: '',
    buttons: [],
    with_cancel_button: false
}