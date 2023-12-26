import React from 'react'
import {Paragraph, Separator, XStack, YStack} from "tamagui";
import {Trash2, Upload} from "@tamagui/lucide-icons";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";
import {KronosPageContext, ModalType} from "../../../../../globals/components/wrappers/KronosPage";
import KronosAlert from "../../../../../globals/components/wrappers/KronosAlert";


export default function DataSetting() {
    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

    const onClickDeleteData = React.useCallback(() => {
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
                        onPress: () => {
                            console.log('delete all data')
                        }
                    }
                ]
            }
        })

    }, []);

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
                        // onPress={onClickDeleteData}
                        justifyContent={'space-between'} label={'EXPORT DATA'} icon={Upload} icon_position={'right'}/>
                </XStack>
                <XStack w={'100%'} paddingVertical={15} paddingHorizontal={5}>
                    <KronosButton
                        width={'100%'}
                        label_props={{fontSize: 16,color:'red'}}
                        icon_props={{color:'red'}}
                        onPress={onClickDeleteData}
                        justifyContent={'space-between'} label={'DELETE DATA'} icon={Trash2} icon_position={'right'}/>
                </XStack>
            </YStack>
        </KronosContainer>
    );
}
