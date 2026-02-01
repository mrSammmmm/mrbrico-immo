'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, PropertyManager } from '@/lib/supabase/database.types'
import type { User as AuthUser } from '@supabase/supabase-js'

interface AuthState {
  user: (User & { propertyManager?: PropertyManager | null }) | null
  authUser: AuthUser | null
  isLoading: boolean
  isAdmin: boolean
  isManager: boolean
}

/**
 * Hook pour gérer l'état d'authentification côté client
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    authUser: null,
    isLoading: true,
    isAdmin: false,
    isManager: false,
  })

  useEffect(() => {
    const supabase = createClient()

    // Récupérer l'utilisateur initial
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          setState({
            user: null,
            authUser: null,
            isLoading: false,
            isAdmin: false,
            isManager: false,
          })
          return
        }

        // Récupérer les infos utilisateur
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single<Record<string, any>>()

        // Si manager, récupérer les infos property_manager
        let managerData = null
        if (userData?.role === 'manager') {
          const { data } = await supabase
            .from('property_managers')
            .select('*')
            .eq('user_id', authUser.id)
            .single<Record<string, any>>()
          managerData = data
        }

        setState({
          user: userData ? { ...userData, propertyManager: managerData } : null,
          authUser,
          isLoading: false,
          isAdmin: userData?.role === 'admin',
          isManager: userData?.role === 'manager',
        })
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
        setState({
          user: null,
          authUser: null,
          isLoading: false,
          isAdmin: false,
          isManager: false,
        })
      }
    }

    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            authUser: null,
            isLoading: false,
            isAdmin: false,
            isManager: false,
          })
        } else if (session?.user) {
          // Recharger les infos utilisateur
          getUser()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return state
}

/**
 * Hook simplifié pour vérifier si l'utilisateur est connecté
 */
export function useIsAuthenticated() {
  const { authUser, isLoading } = useAuth()
  return { isAuthenticated: !!authUser, isLoading }
}
