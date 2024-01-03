import React from 'react'
import * as BackgroundFetch from 'expo-background-fetch'
import {BackgroundTasks} from "../../../../globals/types/tasks";
import {AppState, Platform} from "react-native";
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
    })
})

async function registerPushNotificationsAsync() {
    let token;
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }
    const project_id = Constants.expoConfig?.extra?.eas.projectId
    if (!project_id) {
        alert('Failed to get project id for push notification!')
        return
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C'
        }).then();
    }
}

async function schedulePushNotification(title: string, message: string, datetime: Date) {
    console.log('scheduling notification for ', datetime, 'with title ', title, 'and message ', message)
    return await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: message,
            sound: true,
            vibrate: [250, 500, 250]
            // data: {data: 'goes here'},
        },
        trigger: {
            date: datetime,
        },
    });
}

export default function useTimerNotifications() {
    React.useEffect(() => {
        registerPushNotificationsAsync().then()
    }, []);

    return {
        scheduleNotification: schedulePushNotification,
        cancelNotification: Notifications.cancelScheduledNotificationAsync
    }
}