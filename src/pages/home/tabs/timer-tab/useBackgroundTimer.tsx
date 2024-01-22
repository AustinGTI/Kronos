import React from 'react'
import * as BackgroundFetch from 'expo-background-fetch'
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

export enum TimerNotificationType {
    SEGMENT_END = 'SEGMENT_END',
    SESSION_END = 'SESSION_END',
}

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
        Notifications.setNotificationChannelAsync('segment_complete', {
            name: 'segment_complete',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250],
            sound: 'on_segment_complete.wav',
            lightColor: '#f0d2ff'
        }).then();
        Notifications.setNotificationChannelAsync('session_complete', {
            name: 'session_complete',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 500],
            sound: 'on_session_complete.wav',
            lightColor: '#f0d2ff'
        }).then();
    }
}

async function schedulePushNotification(title: string, message: string, type: TimerNotificationType, datetime: Date) {
    console.log('scheduling notification for ', datetime, 'with title ', title, 'and message ', message)
    return await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: message,
            sound: true,
            // data: {data: 'goes here'},
        },
        trigger: {
            date: datetime,
            channelId: type === TimerNotificationType.SEGMENT_END ? 'segment_complete' : 'session_complete'
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