import React from 'react'
import {ChatState} from '../Context/ChatContext';
import { Box } from '@chakra-ui/react';
import SideDrawer from './miscellaneous/SideDrawer';
import MyChats from './miscellaneous/MyChats';
import ChatBox from './miscellaneous/ChatBox';

const ChatPage = () => {
  console.log(ChatState());
  const {user} = ChatState();

  return (
    <div style={{width: "100%"}}>
      {user && <SideDrawer/>}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats/>}
        {/* {user && <ChatBox/>} */}
      </Box>

    </div>
  )
}

export default ChatPage;
