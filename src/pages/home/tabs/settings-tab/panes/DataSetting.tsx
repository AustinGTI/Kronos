import React from 'react'
import {Paragraph, Separator, XStack, YStack} from "tamagui";
import {RotateCcw, Trash, Trash2, Upload} from "@tamagui/lucide-icons";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";
import {KronosPageContext, ModalType} from "../../../../../globals/components/wrappers/KronosPage";
import KronosAlert from "../../../../../globals/components/wrappers/KronosAlert";
import {useDispatch} from "react-redux";
import {clearActivities, resetActivities} from "../../../../../globals/redux/reducers/activitiesReducer";
import {clearSessions} from "../../../../../globals/redux/reducers/sessionsReducer";
import {clearDurations, resetDurations} from "../../../../../globals/redux/reducers/durationsReducer";


export default function DataSetting() {
    const {modal_props: {openModal}} = React.useContext(KronosPageContext)
    const dispatch = useDispatch()

    const resetToDefaults = React.useCallback(() => {
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Reset to Defaults',
                description: 'This will reset the activities and durations to the ones provided by the app. This action cannot be undone.',
                buttons: [
                    {
                        label: 'Cancel',
                        onPress: (closeAlert) => {
                            closeAlert()
                        }
                    },
                    {
                        label: 'Reset',
                        onPress: (closeAlert) => {
                            dispatch(clearActivities())
                            dispatch(clearDurations())
                            dispatch(resetDurations())
                            dispatch(resetActivities())
                            closeAlert()
                        }
                    }
                ]
            }
        })
    }, [openModal, dispatch]);

    const onClickDeleteSessionData = React.useCallback(() => {
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Delete Session Data',
                description: 'Are you sure you want to delete all session data? This action cannot be undone.',
                buttons: [
                    {
                        label: 'Cancel',
                        onPress: (closeAlert) => {
                            closeAlert()
                        }
                    },
                    {
                        label: 'Delete',
                        onPress: (closeAlert) => {
                            // dispatch(clearActivities)
                            // dispatch(clearDurations)
                            dispatch(clearSessions())
                            closeAlert()
                        }
                    }
                ]
            }
        })
    }, [openModal, dispatch]);

    const onClickDeleteAllData = React.useCallback(() => {
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Delete Data',
                description: 'Are you sure you want to delete all data? This action cannot be undone.',
                buttons: [
                    {
                        label: 'Cancel',
                        onPress: (closeAlert) => {
                            closeAlert()
                        }
                    },
                    {
                        label: 'Delete',
                        onPress: (closeAlert) => {
                            dispatch(clearActivities())
                            dispatch(clearDurations())
                            dispatch(clearSessions())
                            closeAlert()
                        }
                    }
                ]
            }
        })
    }, [openModal, dispatch]);

    return (
        <KronosContainer w={'100%'} my={10}>
            <YStack w={'100%'} paddingVertical={10}>
                <Paragraph fontSize={20}>
                    DATA
                </Paragraph>
                <Separator marginVertical={15}/>
                <XStack w={'100%'} paddingVertical={15} justifyContent={'space-between'} paddingHorizontal={5}>
                    <KronosButton
                        width={'100%'}
                        label_props={{fontSize: 16}}
                        onPress={resetToDefaults}
                        justifyContent={'space-between'} label={'RESET TO DEFAULTS'} icon={RotateCcw}
                        icon_position={'right'}/>
                </XStack>
                <XStack w={'100%'} paddingVertical={15} paddingHorizontal={5}>
                    <KronosButton
                        width={'100%'}
                        label_props={{fontSize: 16}}
                        onPress={onClickDeleteSessionData}
                        justifyContent={'space-between'} label={'DELETE SESSION DATA'} icon={Trash}
                        icon_position={'right'}/>
                </XStack>
                <XStack w={'100%'} paddingVertical={15} paddingHorizontal={5}>
                    <KronosButton
                        width={'100%'}
                        label_props={{fontSize: 16, color: 'red'}}
                        icon_props={{color: 'red'}}
                        onPress={onClickDeleteAllData}
                        justifyContent={'space-between'} label={'DELETE ALL DATA'} icon={Trash2}
                        icon_position={'right'}/>
                </XStack>
            </YStack>
        </KronosContainer>
    );
}
