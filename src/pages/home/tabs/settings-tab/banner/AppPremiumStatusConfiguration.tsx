import useAppSettings from "../../../../../globals/redux/hooks/useAppSettings";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import {Button, Circle, Paragraph, View, XStack, YStack} from "tamagui";
import React from "react";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";
import {Star, X} from "@tamagui/lucide-icons";
import {KronosPageContext, ModalType} from "../../../../../globals/components/wrappers/KronosPage";
import {string} from "yup";
import {widthPercentageToDP} from "react-native-responsive-screen";
import {useDispatch} from "react-redux";
import {downgradeToFree, upgradeToPremium} from "../../../../../globals/redux/reducers/settingsReducer";

interface PremiumStatusModalProps {
    is_premium: boolean
    closeModal: () => void
}

function PremiumStatusModal({is_premium, closeModal}: PremiumStatusModalProps) {
    const dispatch = useDispatch()

    const upgradeAppOnClick = React.useCallback(() => {
        dispatch(upgradeToPremium())
        closeModal()
    }, [dispatch, closeModal]);

    // !only for testing
    const downgradeAppOnClick = React.useCallback(() => {
        dispatch(downgradeToFree())
        closeModal()
    }, [dispatch, closeModal]);

    const BenefitParagraph = React.useCallback(({text}: { text: string }) => {
        return (
            <XStack w={'100%'} paddingVertical={15} alignItems={'center'} justifyContent={'space-between'}>
                <YStack paddingRight={5}>
                    <Circle size={8} backgroundColor={'$color'}/>
                </YStack>
                <Paragraph fontSize={13} textAlign={'center'}>
                    {text}
                </Paragraph>
                <YStack paddingRight={5}>
                    <Circle size={8} backgroundColor={'$color'}/>
                </YStack>
            </XStack>
        )
    }, []);

    return (
        <YStack w={'100%'} alignItems={'center'}>
            <XStack w={'100%'} justifyContent={'center'} paddingBottom={5} paddingTop={10}>
                <KronosContainer>
                    <XStack>
                        <Paragraph fontSize={19}>KRONOS PREMIUM</Paragraph>
                    </XStack>
                </KronosContainer>
                {/*<KronosContainer>*/}
                {/*    <KronosButton icon={X} icon_props={{size: 20}} onPress={closeModal}/>*/}
                {/*</KronosContainer>*/}
            </XStack>
            <KronosContainer w={'95%'}>
                <YStack w={'100%'} alignItems={'center'}>
                    <BenefitParagraph text={'One-Time Cost (No Subscriptions)'}/>
                    <BenefitParagraph text={'Unlimited Activities'}/>
                    <BenefitParagraph text={'Unlimited Durations'}/>
                    <BenefitParagraph text={'Ability to change the app theme'}/>
                    <BenefitParagraph text={'Future premium updates at no extra cost'}/>

                </YStack>
            </KronosContainer>
            <XStack>
                <KronosContainer marginVertical={5}>
                    {is_premium ? (
                        <Paragraph>Thank you for your support!</Paragraph>
                    ) : (
                        <KronosButton
                            label_props={{
                                fontSize: 18,
                                lineHeight: 20
                            }}
                            onPress={upgradeAppOnClick}
                            label={'UPGRADE'}/>
                    )}
                </KronosContainer>
            </XStack>
        </YStack>
    )
}

export default function AppPremiumStatusConfiguration() {
    const {is_premium} = useAppSettings()
    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

    const onClickStatusBadge = React.useCallback(() => {
        openModal({
            type: ModalType.SHEET,
            component: PremiumStatusModal,
            modal_props: {
                height: 55,
                // scrollable: false
            },
            component_props: {
                is_premium
            }
        })
    }, [openModal, is_premium]);

    return (
        <KronosContainer paddingVertical={5}>
            <KronosButton
                paddingBottom={0}
                label_props={{
                    color: is_premium ? '#d4af37' : '#55f',
                    fontSize: 12,
                }}
                label={is_premium ? 'PREMIUM' : 'UPGRADE'}
                onPress={onClickStatusBadge}/>
        </KronosContainer>
    );
}
