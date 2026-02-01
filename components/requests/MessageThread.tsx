'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatRelativeDate } from '@/lib/utils'
import { Send, MessageCircle } from 'lucide-react'
import type { Message } from '@/lib/supabase/database.types'

interface MessageThreadProps {
  workRequestId: string
}

export function MessageThread({ workRequestId }: MessageThreadProps) {
  const { user, isAdmin, isManager } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Charger les messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('work_request_id', workRequestId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // S'abonner aux nouveaux messages en temps réel
    const supabase = createClient()
    const subscription = supabase
      .channel(`messages:${workRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `work_request_id=eq.${workRequestId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [workRequestId])

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    setIsSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('messages').insert({
        work_request_id: workRequestId,
        sender_id: user.id,
        sender_type: isAdmin ? 'admin' : 'manager',
        message: newMessage.trim(),
      })

      if (error) throw error
      setNewMessage('')
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-mrbrico-blue" />
        <h3 className="font-semibold text-mrbrico-gray">Messages</h3>
        {messages.length > 0 && (
          <span className="text-sm text-gray-500">({messages.length})</span>
        )}
      </div>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Écrivez un message pour communiquer avec {isManager ? 'l\'équipe' : 'le gestionnaire'}</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id
            const isFromAdmin = message.sender_type === 'admin'

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={
                      isFromAdmin
                        ? 'bg-mrbrico-orange text-white'
                        : 'bg-mrbrico-blue text-white'
                    }
                  >
                    {isFromAdmin ? 'MB' : 'G'}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-mrbrico-blue text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {formatRelativeDate(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="mt-4 flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez votre message..."
          className="resize-none"
          rows={2}
          disabled={isSending}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || isSending}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
