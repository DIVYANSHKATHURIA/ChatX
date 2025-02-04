import React from 'react'
import { Button } from "../ui/button"
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
} from "../ui/dialog"
import { useState } from "react"
import { ChatState } from '../../Context/ChatContext'

const ProfileModal = () => {
    const [open, setOpen] = useState(false);
    const { user } = ChatState();
  return (
    <div>
        <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogTrigger asChild>
        <Button variant="outline">
        <i className="fas fa-user"></i>

        <span className='hidden md:block'>Profile</span>

        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome, {user.name}!!</DialogTitle>
        </DialogHeader>
        <DialogBody>
            icdbcjs
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
    </div>
  )
}

export default ProfileModal
