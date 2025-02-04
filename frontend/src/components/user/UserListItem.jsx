import React from 'react'

const UserListItem = ({ user, handleFunction, selectedChat }) => {
  return (
    <div 
      onClick={handleFunction}
      className={`cursor-pointer bg-gray-200 hover:bg-teal-500 hover:text-white w-full p-2 mb-2 rounded-lg ${selectedChat === user ? 'bg-teal-500 text-white' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          {user.name[0]}
        </div>
        <div>
          <p className="font-bold">{user.name}</p>
          <p className="text-sm">
            <b>Email:</b> {user.email}
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserListItem
