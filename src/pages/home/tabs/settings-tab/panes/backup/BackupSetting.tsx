import React from 'react'
import {KronosPageContext, ModalType} from "../../../../../../globals/components/wrappers/KronosPage";
import {useDispatch, useSelector} from "react-redux";
import KronosContainer from "../../../../../../globals/components/wrappers/KronosContainer";
import {Paragraph, Separator, XStack, YStack} from "tamagui";
import KronosButton from "../../../../../../globals/components/wrappers/KronosButton";
import {Archive, DownloadCloud, RotateCcw} from "@tamagui/lucide-icons";
import selectAppStateForBackup from "../../../../../../globals/redux/selectors/backupSelector";
import KronosAlert from "../../../../../../globals/components/wrappers/KronosAlert";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from "expo-sharing";
import {restoreValidation} from "./helpers";
import {cacheDirectory, getInfoAsync} from "expo-file-system";
import {restoreActivities} from "../../../../../../globals/redux/reducers/activitiesReducer";
import {restoreSessions} from "../../../../../../globals/redux/reducers/sessionsReducer";
import {restoreDurations} from "../../../../../../globals/redux/reducers/durationsReducer";


export default function BackupSetting() {
    const {modal_props: {openModal}} = React.useContext(KronosPageContext)
    const dispatch = useDispatch()

    const {activities, durations, sessions} = useSelector(selectAppStateForBackup)

    const backupAppData = React.useCallback(async () => {
        const app_data_as_json = JSON.stringify({
            activities,
            durations,
            sessions
        })

        const file_path = FileSystem.documentDirectory + 'kronos_backup.json'

        try {
            await FileSystem.writeAsStringAsync(file_path, app_data_as_json)
            console.log('Successfully backed up app data')
            await Sharing.shareAsync(file_path)
        } catch (e) {
            openModal({
                type: ModalType.ALERT,
                component: KronosAlert,
                component_props: {
                    title: 'Backup Data',
                    description: 'An error occurred while backing up the app data.',
                    with_cancel_button: true,
                    buttons: [],
                }
            })
        }
    }, [activities, durations, sessions, openModal]);

    const createCacheFile = React.useCallback(async (name: string, uri: string) => {
        if (!(await getInfoAsync(cacheDirectory + 'uploads/')).exists) {
            await FileSystem.makeDirectoryAsync(cacheDirectory + 'uploads/', {intermediates: true})
        }
        const cache_file_path = cacheDirectory + 'uploads/' + name
        await FileSystem.copyAsync({
            from: uri,
            to: cache_file_path
        })
        console.log('Successfully created cache file', cache_file_path)
        return cache_file_path
    }, []);
    const restoreAppData = React.useCallback(async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: false
        })

        if (result.type === 'success' && result.uri) {
            const file_path = await createCacheFile(result.name, result.uri)
            try {
                const restore_data = JSON.parse(await FileSystem.readAsStringAsync(file_path))
                // validate the data
                const is_valid = restoreValidation(restore_data)
                if (is_valid) {
                    console.log('Successfully restored app data')
                    openModal({
                        type: ModalType.ALERT,
                        component: KronosAlert,
                        component_props: {
                            title: 'Restore Data',
                            description: 'Successfully restored app data.',
                            with_cancel_button: true,
                            buttons: [],
                        }
                    })
                    // dispatch the data to the store
                    dispatch(restoreActivities(restore_data.activities))
                    dispatch(restoreDurations(restore_data.durations))
                    dispatch(restoreSessions(restore_data.sessions))
                } else {
                    console.error('Invalid restore data make sure this is an authentic backup file then try again.')
                    openModal({
                        type: ModalType.ALERT,
                        component: KronosAlert,
                        component_props: {
                            title: 'Restore Data',
                            description: 'Invalid restore data make sure this is an authentic backup file then try again.',
                            with_cancel_button: true,
                            buttons: [],
                        }
                    })
                }
            } catch (e) {
                console.error('Error restoring app data', e)
                openModal({
                    type: ModalType.ALERT,
                    component: KronosAlert,
                    component_props: {
                        title: 'Restore Data',
                        description: 'An error occurred while restoring the app data.',
                        with_cancel_button: true,
                        buttons: [],
                    }
                })
            }
        }
    }, [])

    const onClickRestoreData = React.useCallback(() => {
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Restore Data',
                description: 'This will replace the existing app data with the data provided by the file. This action cannot be undone.',
                buttons: [
                    {
                        label: 'Cancel',
                        onPress: (closeAlert) => {
                            closeAlert()
                        }
                    },
                    {
                        label: 'Restore',
                        onPress: (closeAlert) => {
                            closeAlert()
                            restoreAppData().then()
                        }
                    }
                ]
            }
        })
    }, [openModal, restoreAppData]);

    return (
        <KronosContainer w={'100%'} my={10} pb={0}>
            <YStack w={'100%'} paddingVertical={10}>
                <Paragraph fontSize={20}>
                    BACKUP & RESTORE
                </Paragraph>
                <Separator marginVertical={15}/>
                <XStack w={'100%'} paddingVertical={15} justifyContent={'space-between'} paddingHorizontal={5}>
                    <KronosButton
                        width={'100%'}
                        label_props={{fontSize: 16}}
                        onPress={backupAppData}
                        justifyContent={'space-between'} label={'BACKUP DATA'} icon={Archive}
                        icon_position={'right'}/>
                </XStack>
                <XStack w={'100%'} paddingVertical={15} justifyContent={'space-between'} paddingHorizontal={5}>
                    <KronosButton
                        width={'100%'}
                        label_props={{fontSize: 16}}
                        onPress={onClickRestoreData}
                        justifyContent={'space-between'} label={'RESTORE'} icon={DownloadCloud}
                        icon_position={'right'}/>
                </XStack>
            </YStack>
        </KronosContainer>
    );
}
