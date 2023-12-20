import React from 'react'
import KronosContainer from "../../wrappers/KronosContainer";
import KronosButton, {KronosButtonProps} from "../../wrappers/KronosButton";
import {Trash2} from "@tamagui/lucide-icons";

interface DeleteButtonProps extends KronosButtonProps {
    onPress: () => void
}

export default function DeleteButton(props:DeleteButtonProps) {
    return (
        <KronosContainer>
            <KronosButton icon={Trash2} {...props}/>
        </KronosContainer>
    );
}
