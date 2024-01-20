import React from 'react'
import {Paragraph, XStack, YStack} from "tamagui";
import {heightPercentageToDP} from "react-native-responsive-screen";
import {Timer} from "@tamagui/lucide-icons";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import ThemeButton from "./ThemeButton";
import {Image} from "react-native";
import useAppSettings from "../../../../../globals/redux/hooks/useAppSettings";
import AppPremiumStatusConfiguration from "./AppPremiumStatusConfiguration";


export default function AppBanner() {
    return (
        <React.Fragment>
            <Image
                source={require('../../../../../../assets/images/kronos_logo_v2.png')}
                style={{
                    width: 350,
                    height: 220
                }}
            />
            <KronosContainer w={'75%'}>
                <YStack w={'100%'} justifyContent={'space-between'}>
                    <YStack alignItems={'center'} paddingTop={10}>
                        <Paragraph fontSize={30} lineHeight={30}>
                            KRONOS
                        </Paragraph>
                        <Paragraph fontSize={10}>
                            By Aught.
                        </Paragraph>
                    </YStack>
                    <XStack alignItems={'center'} justifyContent={'center'} paddingVertical={3}>
                        <AppPremiumStatusConfiguration/>
                    </XStack>
                </YStack>
            </KronosContainer>
        </React.Fragment>
    );
}