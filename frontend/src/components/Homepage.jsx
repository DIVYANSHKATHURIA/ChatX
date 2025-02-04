import React from 'react'
import { Box, Container, Text } from "@chakra-ui/react"
import { Tabs } from "@chakra-ui/react"
import Signup from './Authentication/Signup'
import Login from './Authentication/Login'
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Homepage = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if(user){
      navigate('/chats');
    }
  }, [navigate]);
  return (


    <Container maxW='xl' centerContent>
      <Box
      d='flex'
      justifyContent='center'
      p={3}
      bg={"white"}
      w="100%"
      m="40px 0 15px 0"
      borderRadius="lg"
      borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="work sans" color="black">
            Chatter box
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" color="black" borderWidth="1px">
      <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1">
      <Tabs.List>
        <Tabs.Trigger w="50%" value="tab-1">Login</Tabs.Trigger>
        <Tabs.Trigger w="50%" value="tab-2">Sign Up</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab-1">
        <Login/>
      </Tabs.Content>
      <Tabs.Content value="tab-2">
        <Signup/>
      </Tabs.Content>
      
    </Tabs.Root>
      </Box>
    </Container>
  )
}

export default Homepage
