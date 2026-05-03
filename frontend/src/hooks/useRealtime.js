import { useEffect, useRef, useCallback } from 'react'

const SSE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:5001') + '/api/v1/sse'

export function useRealtime(onMessage) {
    const sourceRef = useRef(null)
    const handlerRef = useRef(onMessage)

    useEffect(() => {
        handlerRef.current = onMessage
    }, [onMessage])

    const connect = useCallback(() => {
        const token = localStorage.getItem('access_token')
        if (!token) return

        const source = new EventSource(`${SSE_URL}?token=${token}`)
        sourceRef.current = source

        source.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data)
                handlerRef.current?.(data)
            } catch {
                handlerRef.current?.(e.data)
            }
        }

        source.onerror = () => {
            source.close()
            sourceRef.current = null
            setTimeout(connect, 3000)
        }
    }, [])

    useEffect(() => {
        connect()
        return () => {
            if (sourceRef.current) {
                sourceRef.current.close()
                sourceRef.current = null
            }
        }
    }, [connect])

    const disconnect = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.close()
            sourceRef.current = null
        }
    }, [])

    return { disconnect }
}
