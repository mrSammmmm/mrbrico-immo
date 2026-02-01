'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Action serveur pour la connexion
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Erreur de connexion:', error.message)
    return { error: 'Email ou mot de passe incorrect' }
  }

  // Récupérer le rôle de l'utilisateur
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single<{ role: string }>()

  revalidatePath('/', 'layout')

  // Rediriger selon le rôle
  if (userData?.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/manager/dashboard')
  }
}

/**
 * Action serveur pour la déconnexion
 */
export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Erreur de déconnexion:', error.message)
    return { error: 'Erreur lors de la déconnexion' }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Récupérer l'utilisateur connecté avec ses infos
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Récupérer les infos utilisateur depuis la table users
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Si manager, récupérer aussi les infos property_manager
  let managerData = null
  if (userData?.role === 'manager') {
    const { data } = await supabase
      .from('property_managers')
      .select('*')
      .eq('user_id', user.id)
      .single()
    managerData = data
  }

  return {
    ...userData,
    propertyManager: managerData,
    authUser: user,
  }
}

/**
 * Vérifier si l'utilisateur est admin
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Vérifier si l'utilisateur est un gestionnaire
 */
export async function isManager() {
  const user = await getCurrentUser()
  return user?.role === 'manager'
}
