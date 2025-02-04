import { Box } from '@chakra-ui/react';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';
import ProfileModal from './ProfileModal';
import { HStack } from "@chakra-ui/react"
import { Avatar } from "../ui/avatar"
import { ChatState } from '../../Context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { Toaster, toaster } from "../ui/toaster"; 
import axios from 'axios';
import UserListItem from '../user/UserListItem';

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '../ui/menu';

import { Input, Stack } from "@chakra-ui/react"
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer"
import { useRef } from "react"
import SearchLoader from '../SearchLoader';

const SideDrawer = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ModalOpen, setModalOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const ref = useRef(null)

  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"];

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  }

  const handleSearch = async() => {
    if(!search) {
      toaster.error({
        title: "Error",
        description: "Please enter a username to search",
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

      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
    

      if(data.length === 0) {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        toaster.error({
          title: "Error",
          description: "No user found",
        });
      }
      setLoading(false);
      setSearchResults(data);
    }  catch (error) {
      console.log(error);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      toaster.error({
        title: "Error",
        description: error.response.data.message,
      });
    }
  }

  const handleSearchResult = async (userId) => {
    try {
      setIsLoadingChat(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Use the logged in user's token
        },
      };
      const { data } = await axios.post(
        'http://localhost:5000/api/chat',
        { userId }, // Pass just the userId
        config
      );
      console.log(data);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      
      setSelectedChat(data);
      setOpenDrawer(false);
    } catch (error) {
      console.log(error);
      toaster.error({
        title: "Error",
        description: error.response?.data?.message || "Error fetching the chat",
      });
    } finally {
      setIsLoadingChat(false);
    }
  }

const pickPalette = (name) => {
  const index = name.charCodeAt(0) % colorPalette.length
  return colorPalette[index]
}
  return (
    <>
    <Toaster />
    <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    bg="white"
    w="100%"
    p="5px 10px 5px 10px"
    borderWidth="1px"
    >
      <Tooltip content="Search User" placement="bottom-start" hasArrow>
      <div>
        <i className="fas fa-search"></i>
        <DrawerRoot initialFocusEl={() => ref.current } isOpen={openDrawer} placement="start" >
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <Button 
        className='text-xl m-3'
        variant="outline" size="sm" onClick={() => setOpenDrawer(true)}>
          Search User
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='text-2xl font-bold' gap={2}>Search User</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
        <Input placeholder="Username" onChange={(e) => setSearch(e.target.value)} border="ridge"
        />
        <Button onClick={handleSearch} isLoading={loading} >Search</Button>
          {loading ? <SearchLoader/> :(
            <Stack gap={2}>
              {searchResults?.map((user) => (
                <UserListItem 
                  key={user._id} 
                  user={user} 
                  handleFunction={() => handleSearchResult(user._id)}
                />
              ))}
            </Stack>
            

          )}
          <Stack mt="5">

          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerActionTrigger>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
      </div>
    </Tooltip>
    <div className="flex-1 flex justify-center p-2 ">
      <p className='font-bold'>
        Chats
      </p>
    </div>
    <div className='flex justify-center items-center gap-2'>
    <MenuRoot >
      <MenuTrigger asChild>
        <Button variant="outline" size="sm">
        <HStack on>
      <Avatar name={user.name} colorPalette={pickPalette(user.name)} />
      <i className="fa-solid fa-chevron-down"></i>
    </HStack>
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="profile" onClick={() => setModalOpen(true)}>
          <ProfileModal 
            isOpen={ModalOpen} 
            onClose={() => setModalOpen(false)}
            onError={(error) => {
              toaster.error({
                title: "Profile Error",
                description: error.message
              });
            }} 
          />
          {/* <i className="fas fa-user"></i>
          <span className='md:block'>Profile</span> */}
        </MenuItem>
        <MenuItem
          value="logout"
          onClick={handleLogout}
          color="fg.error"
          _hover={{ bg: "bg.error", color: "fg.error" }}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span className='hidden md:block'>Logout</span>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
    
    </div>

    
    </Box>
    
    </>
  )
}

export default SideDrawer;
