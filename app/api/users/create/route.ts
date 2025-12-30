import { NextRequest, NextResponse } from 'next/server'
import { UsersService } from '@/lib/services/users'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { email, name, password, role, avatar } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'email, name y password son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await UsersService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      )
    }

    const newUser = await UsersService.createUser({
      email,
      name,
      password,
      role: role || 'member',
      avatar: avatar || '👤'
    })

    console.log('✅ Usuario creado:', newUser.email)
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}

