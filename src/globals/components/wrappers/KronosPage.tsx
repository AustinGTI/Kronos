import React from 'react'
import {AlertDialog, Sheet, View, YStack} from "tamagui";
import SessionViewModal from "../../../pages/home/tabs/calendar-tab/modals/SessionViewModal";
import CalendarPicker from "react-native-calendar-picker";
import {dateToDDMMYYYY} from "../../helpers/datetime_functions";
import {Keyboard, TouchableWithoutFeedback} from "react-native";

export enum ModalType {
    ALERT = 'ALERT',
    SHEET = 'SHEET'
}

export interface GenericModalComponentProps extends Object {
    closeModal?: () => void
}

export interface ModalProps {
    height?: number
}

export interface PageModalProps<ModalComponentProps extends GenericModalComponentProps> {
    /**
     * the type of modal, at the moment there are 2 types, ALERT and SHEET
     */
    type: ModalType
    /**
     * the component rendered inside the modal, should take closeModal as a prop, any other props it takes
     * should be passed in the component_props prop below
     */
    component: React.ComponentType<ModalComponentProps>
    /**
     * the props passed to the component rendered inside the modal
     */
    component_props?: Omit<ModalComponentProps, "closeModal">
    /**
     * the props passed to the actual sheet modal itself rather than the component rendered inside the modal
     */
    modal_props?: ModalProps
}

interface KronosPageProps {
    children: React.ReactNode
}

export interface KronosPageContextProps {
    modal_props: {
        openModal: <ModalComponentProps extends GenericModalComponentProps>(modal_props: PageModalProps<ModalComponentProps>) => void
        closeModal: () => void
    }
}

export const KronosPageContext = React.createContext<KronosPageContextProps>({
    modal_props: {
        openModal: modal_props => null,
        closeModal: () => null
    }
})

export const KRONOS_PAGE_PADDING = 15


export default function KronosPage({children}: KronosPageProps) {
    const [sheet_modal_open, setSheetModalOpen] = React.useState<boolean>(false)
    const [alert_modal_open, setAlertModalOpen] = React.useState<boolean>(false)

    const [modal_data, setModalData] = React.useState<PageModalProps<any> | null>(null)

    const page_context: KronosPageContextProps = React.useMemo(() => ({
        modal_props: {
            openModal: (modal_props) => {
                // based on the modal type, set open state to true and for the other types to false
                console.log('opening modal')
                if (modal_props.type === ModalType.SHEET) {
                    setAlertModalOpen(false)
                    setSheetModalOpen(true)
                } else if (modal_props.type === ModalType.ALERT) {
                    setSheetModalOpen(false)
                    setAlertModalOpen(true)
                }
                // set the modal data
                setModalData(modal_props)
            },
            closeModal: () => {
                setSheetModalOpen(false)
                setAlertModalOpen(false)
                setModalData(null)
            }
        },
    }), [setSheetModalOpen, setAlertModalOpen, setModalData]);

    console.log('alert modal open', alert_modal_open, 'modal data', modal_data)

    return (
        <KronosPageContext.Provider value={page_context}>
            <View w={'100%'} h={'100%'} backgroundColor={'$background'} padding={KRONOS_PAGE_PADDING}>
                {children}
                <Sheet modal={true}
                       open={sheet_modal_open}
                       snapPoints={[modal_data?.modal_props?.height ?? 75]}
                       animationConfig={{
                           type: "spring",
                           damping: 50,
                           stiffness: 500
                       }}
                       onOpenChange={(open: boolean) => {
                           // when the modal closes by dragging to the bottom, clear the data and set modal open to false
                           if (!open) {
                               setSheetModalOpen(false)
                               setModalData(null)
                           }
                       }}
                       dismissOnSnapToBottom
                       disableDrag>
                    <Sheet.Overlay/>
                    <Sheet.Handle/>
                    {
                        // ! There is a bug that causes the sheet frame to glitch upwards when the window frame is open for a few milliseconds
                        // ! This is a fix that sets the background color of the frame to transparent so the glitch can't be seen
                        // ! then creates a View in the sheet with max dimensions and bg white
                    }
                    <Sheet.Frame height={400} backgroundColor={"transparent"} borderWidth={0}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <Sheet.ScrollView w={"100%"} h={"100%"} backgroundColor={"$background"}>
                                {
                                    sheet_modal_open && modal_data && (
                                        React.createElement(modal_data.component, {
                                            ...modal_data.component_props,
                                            closeModal: () => {
                                                setSheetModalOpen(false)
                                                setModalData(null)
                                            }
                                        })
                                    )
                                }
                            </Sheet.ScrollView>
                        </TouchableWithoutFeedback>
                    </Sheet.Frame>
                </Sheet>
                <AlertDialog
                    open={alert_modal_open}
                    onOpenChange={(open: boolean) => {
                        if (!open) {
                            // close the alert modal and set the data to null
                            setAlertModalOpen(false)
                            setModalData(null)
                        }
                    }}>
                    <AlertDialog.Portal>
                        <AlertDialog.Overlay
                            key="overlay"
                            animation="quick"
                            opacity={0.5}
                            enterStyle={{opacity: 0}}
                            exitStyle={{opacity: 0}}
                        />
                        <AlertDialog.Content
                            bordered
                            elevate
                            key="content"
                            animation={[
                                'quick',
                                {
                                    opacity: {
                                        overshootClamping: true,
                                    },
                                },
                            ]}
                            enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}
                            exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}
                            x={0}
                            scale={1}
                            opacity={1}
                            y={0}
                            maxWidth={'90%'}>
                            {
                                alert_modal_open && modal_data && (
                                    React.createElement(modal_data.component, {
                                        ...modal_data.component_props,
                                        closeModal: () => {
                                            setAlertModalOpen(false)
                                            setModalData(null)
                                        }
                                    })
                                )
                            }
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                </AlertDialog>
            </View>
        </KronosPageContext.Provider>
    )
}
