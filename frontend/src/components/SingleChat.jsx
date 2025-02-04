import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Input, VStack, HStack } from '@chakra-ui/react';
import io from "socket.io-client";

import { ChatState } from '../Context/ChatContext';
import { getSender, formatTimestamp } from '../config/ChatLogics';
import axios from 'axios';
import { Toaster, toaster } from "../components/ui/toaster"; 
import { Button } from "../components/ui/button";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "../components/ui/menu";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import Groq from "groq-sdk";

const ENDPOINT = "http://localhost:5000";

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY, // Load from environment variable
  dangerouslyAllowBrowser: true,
});

const SingleChat = ({ fetchChats }) => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [modalType, setModalType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const scrollRef = useRef();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socket = useRef();
  const [groqMessage, setGroqMessage] = useState("");
  const [showGroqInput, setShowGroqInput] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      console.log("Fetching messages for chat:", selectedChat._id);

      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        config
      );
      console.log("Fetched messages:", data);
      setMessages(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toaster.error({
        title: "Error fetching messages",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage || !selectedChat) return;
    
    try {
      const groqResponse = await getGroqChatCompletion(newMessage);

      console.log("GROQ response:", groqResponse.choices[0]?.message?.content || "");

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
          groqResponse: groqResponse.choices[0]?.message?.content || "",
        },
        config
      );

      console.log("Message sent:", data);
      setNewMessage("");
      setMessages([...messages, data]);
      fetchChats();
    } catch (error) {
      console.error("Send error:", error);
      toaster.error({
        title: "Error sending message",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        
        const messageContent = newMessage.trim();
        setNewMessage("");
        
        const { data } = await axios.post(
          "http://localhost:5000/api/message",
          {
            content: messageContent,
            chatId: selectedChat._id,
          },
          config
        );

        socket.current.emit("new message", data);
        setMessages(prev => [...prev, data]);
      } catch (error) {
        toaster.error({
          title: "Error",
          description: "Failed to send message",
        });
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.current.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.current.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
    setFetchAgain(!fetchAgain);
      setIsMenuOpen(false);
    } catch (error) {
      toaster.error({
        title: "Error Occurred!",
        description: error.response.data.message,
        
      });
    }
  };

  const handleAddUser = async (userToAdd) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toaster.error({
        title: "Error Occurred!",
        description: error.response.data.message,
        
      });
    }
  };

  const handleRemoveUser = async (userToRemove) => {

    if (selectedChat.groupAdmin._id !== user._id) {
      toaster.error({
        title: "Error",
        description: "Only admins can remove users",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );

      setSelectedChat(data);
      fetchChats();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toaster.error({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove user",
      });
    }
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSearch = async () => {
    if (!search) {
      toaster.error({
        title: "Error",
        description: "Please enter a username to search",
      });
      return;
    }

    try {
      setSearchLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${search}`,
        config
      );

      if (data.length === 0) {
        toaster.error({
          title: "Error",
          description: "No user found",
        });
      }
      setSearchResults(data);
    } catch (error) {
      toaster.error({
        title: "Error",
        description: error.response.data.message,
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const scrollToBottom = () => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      socket.current = io(ENDPOINT);
      socket.current.emit("setup", user);
      socket.current.on("connected", () => setSocketConnected(true));
    }
  }, [user]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("message received", (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        // Handle notifications here if needed
      } else {
        // Ensure we're not duplicating messages and adding to the correct chat
        setMessages(prev => {
          // Check if message already exists
          const messageExists = prev.some(msg => msg._id === newMessageReceived._id);
          if (messageExists) return prev;
          return [...prev, newMessageReceived];
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.off("message received");
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("typing", () => setIsTyping(true));
    socket.current.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.current.off("typing");
      socket.current.off("stop typing");
    };
  }, []);

  useEffect(() => {
    if (selectedChat && socket.current) {
      // Leave previous chat room if any
      socket.current.emit("leave previous", selectedChat._id);
      // Join new chat room
      socket.current.emit("join chat", selectedChat._id);
    }
  }, [selectedChat]);

  const renderModalContent = () => {
    if(selectedChat.isGroupChat){
      console.log("selectedChat:", selectedChat);
      console.log("groupAdmin:", selectedChat?.groupAdmin);
    
    if (!selectedChat || !selectedChat.groupAdmin) {
        console.error("Missing data for rendering modal content");
        return <Text>Error: Cannot display content</Text>;
      }
    
    switch (modalType) {
      case "rename":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Rename Group</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Input
                placeholder="New group name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button onClick={handleRename}>Update</Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </>
        );
      case "add":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add User to Group</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack spacing={4} w="100%">
                <HStack w="100%">
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button
                    onClick={handleSearch}
                    isLoading={searchLoading}
                  >
                    <i className="fa fa-search" aria-hidden="true"></i>
                    
                  </Button>
                </HStack>
                <VStack w="100%" maxH="200px" overflowY="auto">
                  {searchResults.map((searchUser) => (
                    <HStack
                      key={searchUser._id}
                      w="100%"
                      p={2}
                      borderRadius="lg"
                      _hover={{ bg: "purple.100" }}
                      justify="space-between"
                    >
                      <Text>{searchUser.name}</Text>
                      <Button 
                        size="sm"
                        onClick={() => {
                          handleAddUser(searchUser);
                          console.log("Current users in chat:", selectedChat.users);
                        }}
                      >
                        Add
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Close</Button>
              </DialogActionTrigger>
            </DialogFooter>
          </>
        );
      case "remove":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Remove User from Group</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack w="100%" maxH="200px" overflowY="auto" spacing={2}>
                {selectedChat.users?.filter(u => u._id !== selectedChat.groupAdmin._id).map((chatUser) => (
                  <HStack
                    key={`${chatUser._id}-${selectedChat.users.length}`}
                    w="100%"
                    p={2}
                    borderRadius="lg"
                    _hover={{ bg: "purple.100" }}
                    justify="space-between"
                    bg="white"
                  >
                    <Text>{chatUser.name}</Text>
                    <Button 
                      size="sm"
                      colorScheme="red"
                      onClick={async () => {
                        await handleRemoveUser(chatUser);
                      }}
                      
                      isLoading={loading}
                    >
                      Remove
                    </Button>
                  </HStack>
                ))}
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Close</Button>
              </DialogActionTrigger>
            </DialogFooter>
          </>
        );
    }
}
  };

  async function getGroqChatCompletion(userMessage) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: userMessage,
            },
        ],
        model: "llama-3.3-70b-versatile",
    });
  }

  const handleSendGroqMessage = async () => {
    if (!groqMessage) return;

    try {
        const groqResponse = await getGroqChatCompletion(groqMessage);

        console.log("GROQ response:", groqResponse.choices[0]?.message?.content || "");

        // Set the GROQ response in the new message input
        setNewMessage(groqResponse.choices[0]?.message?.content || "");
        
        // Optionally, you can also send the message immediately if desired
        // Uncomment the following lines if you want to send it right away
        /*
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        };

        const { data } = await axios.post(
            "http://localhost:5000/api/message",
            {
                content: groqResponse.choices[0]?.message?.content || "",
                chatId: selectedChat._id,
            },
            config
        );

        socket.current.emit("new message", data); // Emit the new message
        */

        setGroqMessage(""); // Clear the GROQ input
    } catch (error) {
        console.error("Error sending message to GROQ:", error);
    }
  };

  const toggleGroqInput = () => {
    setShowGroqInput(prev => !prev);
  };

  return (
    <Box 
      display="flex" 
      flexDir="column" 
      w="100%" 
      h="auto"
      bg="white"
      borderRadius="lg"
      boxShadow="0 4px 12px rgba(0,0,0,0.05)"
      position="relative"
    >
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <Box 
            py={3} 
            px={4} 
            bg="purple.500" 
            borderTopRadius="lg"
            borderBottom="1px"
            borderColor="purple.600"
          >
            <HStack justify="space-between" align="center" w="100%">
              <Text 
                fontSize="xl" 
                fontWeight="bold"
                color="white"
              >
                {selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : getSender(user, selectedChat.users)}
              </Text>
              {selectedChat.isGroupChat && (
                <MenuRoot isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} >
                  <MenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      style={{ color: 'white' }}

                    >
                      <i className="fas fa-ellipsis-v" />
                    </Button>
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem 
                      value="rename" 
                      onClick={() => {
                        setModalType("rename");
                        handleModalOpen();
                      }}
                    >
                      Rename Group
                    </MenuItem>
                    <MenuItem 
                      value="add" 
                      onClick={() => {
                        setModalType("add");
                        handleModalOpen();
                      }}
                    >
                      Add User
                    </MenuItem>
                    <MenuItem 
                      value="remove" 
                      onClick={() => {
                        setModalType("remove");
                        handleModalOpen();
                      }}
                    >
                      Remove User
                    </MenuItem>
                  </MenuContent>
                </MenuRoot>
              )}
            </HStack>
          </Box>

          {/* Messages Area */}
          <Box 
            ref={scrollRef}
            display="flex"
            flexDir="column"
            overflowY="auto" // Changed to 'auto' to allow for overflowing along height
            w="100%"
            h="100%"
            p={3}
            bg="white"
            borderRadius="lg"
            overflowX="hidden"
          >
            {messages && messages.map((m, i) => (
              <Box
                key={m._id || i}
                display="flex"
                justifyContent={m.sender._id === user._id ? "flex-end" : "flex-start"}
              >
                <span
                  style={{
                    backgroundColor: m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0",
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    marginBottom: "3px",
                  }}
                >
                  {m.content}
                </span>
              </Box>
              
            ))}
            
          </Box>

          {/* Updated button styling for left alignment */}
          <Box display="flex" justifyContent="flex-start" mb={2}>
            <Button 
              onClick={toggleGroqInput}
              colorScheme="teal"
              variant="solid"
              size="md"
              borderRadius="md"
              _hover={{ bg: "teal.600" }}
              style={{ transition: "all 0.2s" }}
            >
              {showGroqInput ? "Hide AI Input" : "Show AI Input"}
            </Button>
          </Box>

          <Box 
            p={4} 
            bg="white"
            borderTop="1px"
            borderColor="gray.200"
            position="sticky"
            bottom="0"
            width="100%"
          >
            <HStack spacing={3}>
              <Input
                variant="filled"
                bg="white"
                placeholder="Enter a message..."
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={sendMessage}
              />
              <i className="fa fa-paper-plane" aria-hidden="true"
                
                borderRadius="full"
                size="lg"
                onClick={handleSendMessage }
                aria-label="Send message"
                opacity={newMessage ? 1 : 0}
                transform={newMessage ? "scale(1)" : "scale(0.8)"}
                transition="all 0.2s"
                _hover={{
                  transform: "scale(1.05)"
                }}
              />
            </HStack>
          </Box>

          {/* Button to toggle GROQ input visibility */}
          
          {/* New input area for sending messages to GROQ */}
          {showGroqInput && ( // Conditionally render the GROQ input
            <Box p={4} bg="white" borderTop="1px" borderColor="gray.200" position="sticky" bottom="0" width="100%">
              <HStack spacing={3}>
                <Input
                  variant="filled"
                  bg="white"
                  placeholder="Send a message to AI..."
                  value={groqMessage}
                  onChange={(e) => setGroqMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" ) {
                      handleSendGroqMessage();
                    }
                  }}
                />
                <Button onClick={handleSendGroqMessage}>Send to AI</Button>
              </HStack>
            </Box>
          )}
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
      
      <DialogRoot open={isModalOpen} onOpenChange={handleModalClose} motionPreset="slide-in-bottom">
        <DialogContent>
          {renderModalContent()}
        </DialogContent>
      </DialogRoot>

      {isTyping && (
        <div className="typing-indicator">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}
    </Box>
  );
};

export default SingleChat; 