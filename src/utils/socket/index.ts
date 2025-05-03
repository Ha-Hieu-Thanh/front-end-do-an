import configs from '@/connstant/config';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
const token = Cookies.get('token') || '';

const socket = io('/', {
  transports: ['websocket'],
  extraHeaders: { authorization: token },
  auth: { token },
});

export default socket;
