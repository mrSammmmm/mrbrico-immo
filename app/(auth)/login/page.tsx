'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ButtonLoader } from '@/components/shared/LoadingSpinner'
import { Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Email ou mot de passe incorrect')
        setIsLoading(false)
        return
      }

      // Récupérer le rôle de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userError || !userData) {
        setError('Impossible de récupérer les informations utilisateur')
        setIsLoading(false)
        return
      }

      // Rediriger selon le rôle
      if (userData.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/manager/dashboard')
      }

      router.refresh()
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-mrbrico-gray">
          Connexion
        </CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder au portail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Adresse courriel</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Bouton de connexion */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <ButtonLoader />}
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        {/* Aide */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Problème de connexion?</p>
          <a
            href="mailto:info@mrbrico.ca"
            className="text-mrbrico-blue hover:underline"
          >
            Contactez-nous
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
