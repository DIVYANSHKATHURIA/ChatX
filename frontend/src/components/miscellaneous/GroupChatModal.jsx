import React, { useState } from 'react'
import { VStack } from "@chakra-ui/react"
import { Button } from "../ui/button"
import { DataListItem, DataListRoot } from "../ui/data-list"
import { Input } from "@chakra-ui/react"

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

import { Toaster, toaster } from "../ui/toaster"; 
import axios from "axios"
import { ChatState } from "../../Context/ChatContext"

const GroupChatModal = ({ children }) => {
  const [groupChatName, setGroupChatName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [search, setSearch] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)

  const { user, chats, setChats } = ChatState()

  const handleSearch = async (query) => {
    setSearch(query)
    if (!query) return

    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      const { data } = await axios.get(`http://localhost:5000/api/user?search=${query}`, config)
      setSearchResult(data)
      setLoading(false)
    } catch (error) {
      toaster.error({
        title: "Error occurred!",
        description: "Failed to load the search results",
        status: "error",
      })
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toaster.error({
        title: "Please fill all the fields",
        status: "warning",
      })
      return
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      const { data } = await axios.post(
        "http://localhost:5000/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      )

      setChats([data, ...chats])
      toaster.success({
        title: "New Group Chat Created!",
        status: "success",
      })
    } catch (error) {
      toaster.error({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
      })
    }
  }

  return (
    <VStack alignItems="start" w="100%">
      <DialogRoot>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-blue-50 to-purple-50">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <DialogTitle className="text-2xl font-bold">Create Group Chat</DialogTitle>
          </DialogHeader>
          <DialogBody className="py-6 px-4">
            <VStack spacing={6} align="stretch" w="100%">
              <Input
                placeholder="Enter Chat Name"
                size="lg"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                className="border-2 border-blue-200 focus:border-blue-400 rounded-lg"
              />
              <Input
                placeholder="Search users to add..."
                size="lg"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-purple-200 focus:border-purple-400 rounded-lg"
              />

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  <text className="text-sm font-semibold text-purple-700">
                    Selected Users ({selectedUsers.length})
                  </text>
                  <DataListRoot className="max-h-[100px] overflow-y-auto bg-white rounded-lg border-2 border-blue-100">
                    {selectedUsers.map(user => (
                      <DataListItem
                        key={user._id}
                        className="flex items-center justify-between py-2 px-3 hover:bg-red-50 cursor-pointer transition-colors duration-200"
                        onClick={() => setSelectedUsers(selectedUsers.filter(sel => sel._id !== user._id))}
                      >
                        <span className="text-blue-700">{user.name}</span>
                        <span className="text-sm text-red-500 hover:text-red-700">Click to remove</span>
                      </DataListItem>
                    ))}
                  </DataListRoot>
                </VStack>
              )}

              {/* Search Results */}
              {loading ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-md text-purple-600"></span>
                </div>
              ) : (
                searchResult.length > 0 && (
                  <VStack align="stretch" spacing={2}>
                    <text className="text-sm font-semibold text-blue-700">
                      Search Results
                    </text>
                    <DataListRoot className="max-h-[150px] overflow-y-auto bg-white rounded-lg border-2 border-purple-100">
                      {searchResult?.slice(0, 4).map(user => (
                        <DataListItem
                          key={user._id}
                          className={`flex items-center py-2 px-3 transition-colors duration-200 ${
                            selectedUsers.find(sel => sel._id === user._id)
                              ? 'bg-purple-50 text-gray-500 cursor-not-allowed'
                              : 'hover:bg-blue-50 cursor-pointer text-blue-700'
                          }`}
                          onClick={() => setSelectedUsers([...selectedUsers, user])}
                          disabled={selectedUsers.find(sel => sel._id === user._id)}
                        >
                          {user.name}
                        </DataListItem>
                      ))}
                    </DataListRoot>
                  </VStack>
                )
              )}

              <Button 
                onClick={handleSubmit}
                className={`w-full mt-4 text-white font-semibold py-2 rounded-lg transition-colors duration-200 ${
                  !groupChatName || selectedUsers.length < 2
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                }`}
                disabled={!groupChatName || selectedUsers.length < 2}
              >
                Create Group Chat
              </Button>
            </VStack>
          </DialogBody>
          <DialogCloseTrigger className="absolute top-4 right-4 text-white hover:text-gray-200" />
        </DialogContent>
      </DialogRoot>
    </VStack>
  )
}

export default GroupChatModal
