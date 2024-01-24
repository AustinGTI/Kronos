import React from 'react'
import {Paragraph, XStack, YStack} from "tamagui";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import {Image} from "react-native";
import AppPremiumStatusConfiguration from "./AppPremiumStatusConfiguration";
import AppLogo from "./AppLogo";
import {widthPercentageToDP} from "react-native-responsive-screen";


export default function AppBanner() {
    const percentage_size = 50
    return (
        <React.Fragment>
            {/*<Image*/}
            {/*    source={require('../../../../../../assets/images/kronos_logo_v2.png')}*/}
            {/*    style={{*/}
            {/*        width: 350,*/}
            {/*        height: 220*/}
            {/*    }}*/}
            {/*/>*/}
            <AppLogo width={widthPercentageToDP(`${percentage_size}%`)}
                     height={widthPercentageToDP(`${percentage_size}%`)}/>
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
