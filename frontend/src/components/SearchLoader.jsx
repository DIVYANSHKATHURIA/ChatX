import React from 'react'
import { Stack } from '@chakra-ui/react'
import { Skeleton } from './ui/skeleton'

const SearchLoader = () => {
  return (
    <Stack>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </Stack>
  )
}

export default SearchLoader
