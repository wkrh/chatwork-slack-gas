interface ChatworkMessage {
    message_id: string;
    account: {
        account_id: number;
        name: string;
        avatar_image_url: string;
    };
    body: string;
    send_time: number;
    update_time: number;
}

interface ChatworkRoom {
    room_id: number;
    name: string;
    type: string;
    role: string;
    sticky: boolean;
    unread_num: number;
    mention_num: number;
    mytask_num: number;
    message_num: number;
    file_num: number;
    task_num: number;
    icon_path: string;
    last_update_time: number;
    description: string;
}

const scriptProperties = PropertiesService.getScr3iptProperties();

function main () {
    const rooms: Partial<ChatworkRoom>[] = JSON.parse(scriptProperties.getProperty('rooms'));
    rooms.forEach(room => {
        forwardChatworkRoomToSlack(room);
    });
}

function forwardChatworkRoomToSlack (room: Partial<ChatworkRoom>) {
    getChatworkMessages(room.room_id).forEach(msg => {
        slack(formatMessage(msg, room));
    });
}

function formatMessage (msg: ChatworkMessage, room: Partial<ChatworkRoom>) {
    const sendTime = new Date(msg.send_time * 1000);
    return {
        text: `${room.name || room.room_id}: ${msg.account.name}: ${msg.body}`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:house: <https://www.chatwork.com/#!rid${room.room_id}|${room.name || room.room_id}>
:clock3: *${sendTime.toLocaleString()}*
:open_mouth: _${msg.account.name}_
:globe_with_meridians: <https://www.chatwork.com/#!rid${room.room_id}-${msg.message_id}>`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'plain_text',
                    text: `${msg.body}`,
                },
            },
        ]
    };
}

function getChatworkMessages (roomId: number, force = false): ChatworkMessage[] {
    const res = UrlFetchApp.fetch(`https://api.chatwork.com/v2/rooms/${roomId}/messages?force=${force ? 1 : 0}`, {
        headers : { "X-ChatWorkToken" : scriptProperties.getProperty('chatworkToken') },
    });
    return JSON.parse(res.getContentText() || '[]');
}

function slack (data: any) {
    UrlFetchApp.fetch(scriptProperties.getProperty('slackWebhookUrl'), {
        payload: JSON.stringify(data)
    });
}
