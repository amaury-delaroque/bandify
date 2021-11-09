export const initialState = {
  online: [],
  notifications: [],
  isTyping: [],
};

const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case 'GET_ONLINE_MEMBERS': {
      return {
        ...state,
        online: action.online,
      };
    }
    case 'GET_ALL_INVITATIONS_NOTIFS': {
      /*
        At login and reconnect when making the call to the DB:
          *retrieve all status pending invitations where the user is invitation.toMember
            copy each of these invitations into the notifications table
          *retrieve all unread status messages where the receiver is message.reicever_id
            copy each of these messages into the notifications array
      */

      return {
        ...state,
        notifications: [
          ...state.notifications,
          action.notif,
        ],
      };
    }
    case 'GET_ALL_MESSAGES_NOTIFS': {
      const foundSenderMessagesNotif = state.notifications.find((n) => n.notification === 'message' && (action.notif.sender.id === n.sender.id));
      if (foundSenderMessagesNotif) {
        const newNotifs = state.notifications.filter((n) => {
          if (n.notification === 'message') {
            return action.notif.sender.id !== n.sender.id;
          }
          return n;
        });
        foundSenderMessagesNotif.messages.push(action.notif.messages[0]);
        newNotifs.push(foundSenderMessagesNotif);
        return {
          ...state,
          notifications: [...newNotifs],
        };
      }
      return {
        ...state,
        notifications: [...state.notifications, action.notif],
      };
    }
    case 'FRIEND_IS_NOT_TYPPING':
      return {
        ...state,
        isTyping: [action.friend, false],
      };
    case 'FRIEND_IS_TYPPING':
      return {
        ...state,
        isTyping: [action.friend, true],
      };
    case 'GET_NEW_MESSAGE': {
      /*
        Each new message I receive via the 'new message' socket
        I add it to the notifications. This action comes from the middleware socket and
        also goes into the reducer settings to add the message to the message board
      */
      const foundSenderMessagesNotif = state.notifications.find((n) => n.notification === 'message' && (action.notif.sender.id === n.sender.id));
      if (foundSenderMessagesNotif) {
        const newNotifs = state.notifications.filter((n) => {
          if (n.notification === 'message') {
            return action.notif.sender.id !== n.sender.id;
          }
          return n;
        });
        foundSenderMessagesNotif.messages.push(action.notif.messages[0]);
        newNotifs.push(foundSenderMessagesNotif);
        return {
          ...state,
          notifications: [...newNotifs],
        };
      }
      return {
        ...state,
        notifications: [...state.notifications, action.notif],
      };
    }
    case 'GET_NEW_INVITATION': {
     /*
        Each time I receive a new invitation via the 'new invitation' socket
        socket, I add it to the notifications. This action comes from the socket middleware and
        also goes into the reducer settings to add the invitation to the invitation table
      */
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            notification: 'invitation',
            invitation: { ...action.invitation },
          },
        ],
      };
    }
    case 'UPDATE_MESSAGES_NOTIFICATIONS': {
      const filteredNotif = state.notifications.filter((n, i) => i !== action.index);
      return {
        ...state,
        notifications: filteredNotif,
      };
    }
    case 'DELETE_FRIEND_NOTIFICATION': {
      const filteredNotif = state.notifications.filter((n, i) => i !== action.index);
      return {
        state,
        notifications: filteredNotif,
      };
    }
    case 'INVITATION_ACCEPTED': {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            notification: 'new-friend',
            invitation: { ...action.invitation },
          },
        ],
      };
    }
    case 'ON_ACCEPT_INVITATION_SUCCESS': {
      const filteredNotifications = state.notifications.filter((notif, index) => (
        index !== action.invIndex));
      return {
        ...state,
        notifications: filteredNotifications,
      };
    }
    case 'ON_DENY_INVITATION_SUCCESS': {
      const filteredNotifications = state.notifications.filter((notif, index) => (
        index !== action.invIndex));
      return {
        ...state,
        notifications: filteredNotifications,
      };
    }
    case 'ON_LOGOUT':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

export default reducer;
