import { createContext, useContext } from 'react'

export interface ConnectingFrom {
  nodeId: string
  handleId: string
}

interface ContextValue {
  connectingFrom: ConnectingFrom | null
  onHandleClick: (nodeId: string, handleId: string) => void
}

export const ConnectionContext = createContext<ContextValue>({
  connectingFrom: null,
  onHandleClick: () => {},
})

export const useConnectionContext = () => useContext(ConnectionContext)
