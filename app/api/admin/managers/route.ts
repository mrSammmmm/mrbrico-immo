import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[API] POST /api/admin/managers - Début')

    // Client normal pour vérifier l'authentification
    const supabase = await createClient()

    // Vérifier que l'utilisateur est admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[API] User:', user?.id, 'Error:', authError?.message)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier le rôle admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<Record<string, any>>()

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Admin seulement' },
        { status: 403 }
      )
    }

    // Récupérer les données du formulaire
    const body = await request.json()
    console.log('[API] Body reçu:', { ...body, password: '***' })
    const { fullName, email, password, companyName, contact_phone, address, notes } = body

    // Validation
    if (!fullName || !email || !password || !companyName) {
      console.log('[API] Validation échouée - champs manquants')
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Utiliser le service client pour créer l'utilisateur (bypasse RLS)
    const serviceClient = createServiceClient()

    // Créer l'utilisateur avec le service client
    console.log('[API] Création utilisateur pour:', email)
    const { data: authData, error: signUpError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      console.log('[API] Erreur création user:', signUpError)
      return NextResponse.json(
        { error: `Erreur création utilisateur: ${signUpError.message}` },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Utilisateur non créé' },
        { status: 400 }
      )
    }

    // Mettre à jour le rôle dans la table users (avec service client)
    const { error: updateError } = await serviceClient
      .from('users')
      .update({
        role: 'manager',
        full_name: fullName
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('Erreur mise à jour rôle:', updateError)
      // On continue quand même car l'utilisateur est créé
    }

    // Créer l'entrée property_manager (avec service client pour bypasser RLS)
    console.log('[API] Création property_manager pour user_id:', authData.user.id)
    const { data: managerData, error: managerError } = await serviceClient
      .from('property_managers')
      .insert({
        user_id: authData.user.id,
        company_name: companyName,
        contact_email: email,
        contact_phone: contact_phone || null,
        address: address || null,
        notes: notes || null,
      })
      .select()
      .single<Record<string, any>>()

    if (managerError) {
      console.log('[API] Erreur création manager:', managerError)
      return NextResponse.json(
        { error: `Erreur création gestionnaire: ${managerError.message}` },
        { status: 400 }
      )
    }

    console.log('[API] Succès! Manager créé:', managerData.id)
    return NextResponse.json({
      success: true,
      data: {
        id: managerData.id,
        user_id: authData.user.id,
        email: authData.user.email,
        company_name: companyName,
      },
    })

  } catch (error) {
    console.error('[API] ERREUR CATCH:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Vérifier que l'utilisateur est admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier le rôle admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<Record<string, any>>()

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Admin seulement' },
        { status: 403 }
      )
    }

    // Récupérer les données du formulaire
    const body = await request.json()
    const { managerId, fullName, email, companyName, contact_phone, address, notes } = body

    // Validation
    if (!managerId || !fullName || !email || !companyName) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Récupérer le gestionnaire
    const { data: manager, error: fetchError } = await supabase
      .from('property_managers')
      .select('user_id')
      .eq('id', managerId)
      .single<Record<string, any>>()

    if (fetchError || !manager) {
      return NextResponse.json(
        { error: 'Gestionnaire non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour les informations utilisateur
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        email: email,
      })
      .eq('id', manager.user_id)

    if (updateUserError) {
      console.error('Erreur mise à jour utilisateur:', updateUserError)
    }

    // Mettre à jour le gestionnaire
    const { data: updatedManager, error: updateManagerError } = await supabase
      .from('property_managers')
      .update({
        company_name: companyName,
        contact_phone: contact_phone || null,
        address: address || null,
        notes: notes || null,
      })
      .eq('id', managerId)
      .select()
      .single<Record<string, any>>()

    if (updateManagerError) {
      return NextResponse.json(
        { error: `Erreur mise à jour gestionnaire: ${updateManagerError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedManager,
    })

  } catch (error) {
    console.error('Erreur API mise à jour gestionnaire:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
