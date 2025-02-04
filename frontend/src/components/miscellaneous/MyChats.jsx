import React, { useState, useEffect } from 'react'
import { Box, Button, Spinner, Stack, Text} from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatContext';
import axios from 'axios';
// import { AddIcon } from '@chakra-ui/icons';
import GroupChatModal from './GroupChatModal.jsx';
import SingleChat from '../SingleChat';
import { Toaster, toaster } from "../ui/toaster"; 
import { getSender } from '../../config/ChatLogics.jsx';
import io from 'socket.io-client';
const ENDPOINT = "http://localhost:5000";
let socket;


const MyChats = () => {
  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const [loggedUser, setLoggedUser] = useState();
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newMessageChats, setNewMessageChats] = useState(new Set());
  

  const fetchChats = async () => {
    console.log("User in fetchChats:", user);
    
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("http://localhost:5000/api/chat", config);
      const sortedChats = data.sort((a, b) => {
        const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(0);
        const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(0);
        return timeB - timeA;
      });
      setChats(sortedChats);
      console.log("Fetched chats data:", data);
    } catch (error) {
      toaster.error({
        title: "Error fetching chats",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    socket.on("message received", (newMessageReceived) => {
      setChats((prevChats) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          setNewMessageChats(prev => new Set(prev).add(newMessageReceived.chat._id));
        }
        
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === newMessageReceived.chat._id) {
            return { ...chat, latestMessage: newMessageReceived };
          }
          return chat;
        });

        const chatIndex = updatedChats.findIndex(
          (chat) => chat._id === newMessageReceived.chat._id
        );
        if (chatIndex > -1) {
          const [chat] = updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(chat);
        }

        return updatedChats;
      });
    });

    return () => {
      socket.off("setup");
      socket.off("connected");
      socket.off("message received");
    };
  }, []);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);
    if (userInfo) {
      fetchChats();
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setNewMessageChats(prev => {
        const updated = new Set(prev);
        updated.delete(selectedChat._id);
        return updated;
      });
    }
  }, [selectedChat]);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      w="100%"
      h="91.5vh"
      p="10px"
    >
      <Box
        p={4}
        borderRadius="md"
        boxShadow="md"
        backgroundColor="white"
        color="black"
        width="37%"
        display={{ base: "none", md: "flex" }}
        flexDir="column"
      >
        <Box
          pb={3}
          px={3}
          fontSize={{ base: "28px", md: "30px" }}
          display="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          whiteSpace="nowrap"
        >
          My Chats
          <GroupChatModal>
              <Button
                fontSize={{ base: "10px", md: "10px", lg: "17px" }}
                marginLeft="auto"
                w="fit-content"
                display="flex"
                alignItems="center"
                gap="2"
              >
                New Group Chat
                <i className="fa-solid fa-plus"></i>
              </Button>
          </GroupChatModal>
        </Box>

        <Box
          d="flex"
          flexDir="column"
          p={3}
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="hidden"
        >
          {loading ? (
            <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
          ) : (
            <Stack 
              overflowY="auto"
              height="calc(100vh - 200px)"
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '24px',
                },
              }}
              spacing={3}
            >
              {chats && Array.isArray(chats) && loggedUser && chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : 
                      newMessageChats.has(chat._id) ? "#c5e4e2" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                  position="relative"
                  transition="all 0.3s"
                  _hover={{
                    bg: selectedChat === chat ? "#38B2AC" : 
                        newMessageChats.has(chat._id) ? "#b0dcd9" : "#d4d4d4",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                  _before={newMessageChats.has(chat._id) ? {
                    content: '""',
                    position: "absolute",
                    
                    left: "-10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "red",
                  } : {}}
                >
                  <Text fontWeight="bold">
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                  {chat.latestMessage && (
                    <Box 
                      fontSize="sm" 
                      color={selectedChat === chat ? "white" : "gray.600"}
                      bg={selectedChat === chat ? "teal.600" : "gray.100"}
                      p={2}
                      borderRadius="md"
                      mt={1}
                      width="100%"
                      display="block"
                      minHeight="40px"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <b>{chat.latestMessage.sender?.name || "Unknown"}: </b>
                      <span style={{ 
                        wordBreak: "break-word",
                        display: "inline-block"
                      }}>
                        {chat.latestMessage.content.slice(0, 50) + (chat.latestMessage.content.length > 50 ? "..." : "") || "No message content"}
                      </span>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      <Box
        p={4}
        borderRadius="md"
        boxShadow="md"
        backgroundColor="white"
        color="black"
        width={{ base: "100%", md: "60%" }}
        display="flex"
      >
        {selectedChat ? (
          <SingleChat fetchChats={fetchChats} />
        ) : (
          <Box 
            d="flex" 
            alignItems="center" 
            justifyContent="center" 
            h="100%"
            flexDirection="column"
          >
            <Text 
              fontSize="3xl" 
              pb={3}
              color="gray.500"
              fontWeight="medium"
            >
              Click on a user to start chatting
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default MyChats;
