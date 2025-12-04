import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { findUserByEmail, verifyPassword } from './users'
import { UsersService } from './services/users'

const JWT_SECRET = process.env.JWT_SECRET || 'mini-monday-secret-key-2024'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  avatar?: string
}

export const createToken = (user: AuthUser): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role,
      avatar: user.avatar
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export const authenticateUser = async (email: string, password: string): Promise<AuthUser | null> => {
  try {
    console.log('🔍 authenticateUser: Starting authentication for email:', email)
    
    // Buscar usuario en Google Sheets
    const user = await UsersService.getUserByEmail(email)
    
    if (user) {
      console.log('🔍 authenticateUser: User found in Sheets:', { 
        id: user.id, 
        email: user.email, 
        name: user.name || user.username, 
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0
      })
      
      // Verificar que la contraseña existe
      if (!user.password || user.password.trim() === '') {
        console.error('❌ authenticateUser: User has no password set in Sheets')
        return null
      }
      
      // Check if password is hashed or plain text
      const isHashed = user.password && (
        user.password.startsWith('$2a$') || 
        user.password.startsWith('$2b$') || 
        user.password.startsWith('$2y$') ||
        user.password.startsWith('$2$')
      )
      
      let isValidPassword = false
      
      if (isHashed) {
        // Verify password using bcrypt
        const bcrypt = require('bcryptjs')
        try {
          isValidPassword = await bcrypt.compare(password, user.password)
          console.log('🔍 authenticateUser: Password is hashed, comparison result:', isValidPassword)
        } catch (bcryptError) {
          console.error('❌ authenticateUser: Error comparing hashed password:', bcryptError)
          isValidPassword = false
        }
      } else {
        // Direct comparison for plain text passwords (case-sensitive)
        // También comparar sin espacios en blanco al inicio/final
        const inputPassword = password.trim()
        const storedPassword = user.password.trim()
        isValidPassword = inputPassword === storedPassword
        
        console.log('🔍 authenticateUser: Password is plain text')
        console.log('🔍 authenticateUser: Input password length:', inputPassword.length)
        console.log('🔍 authenticateUser: Stored password length:', storedPassword.length)
        console.log('🔍 authenticateUser: Passwords match:', isValidPassword)
        
        // No loggear las contraseñas completas por seguridad, solo los primeros caracteres
        if (!isValidPassword) {
          console.log('🔍 authenticateUser: Input password starts with:', inputPassword.substring(0, 2))
          console.log('🔍 authenticateUser: Stored password starts with:', storedPassword.substring(0, 2))
        }
      }
      
      if (isValidPassword) {
        console.log('✅ authenticateUser: Authentication successful for user:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username || 'Usuario',
          role: (user.role || 'member') as 'owner' | 'admin' | 'member',
          avatar: user.avatar
        }
      } else {
        console.error('❌ authenticateUser: Invalid password for user:', user.email)
        return null
      }
    }
    
    console.log('⚠️ authenticateUser: User not found in Google Sheets, trying fallback...')
    
    // Fallback to hardcoded users for backward compatibility
    const hardcodedUser = findUserByEmail(email)
    if (hardcodedUser && verifyPassword(password, hardcodedUser.password)) {
      console.log('✅ authenticateUser: Authentication successful via fallback for:', email)
      return {
        id: hardcodedUser.id,
        email: hardcodedUser.email,
        name: hardcodedUser.name,
        role: hardcodedUser.role,
        avatar: hardcodedUser.avatar
      }
    }
    
    console.error('❌ authenticateUser: Authentication failed - user not found or invalid credentials')
    return null
  } catch (error) {
    console.error('❌ authenticateUser: Error during authentication:', error)
    if (error instanceof Error) {
      console.error('❌ authenticateUser: Error message:', error.message)
      console.error('❌ authenticateUser: Error stack:', error.stack)
    }
    return null
  }
}

export const getCurrentUser = (request: NextRequest): AuthUser | null => {
  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return null
  }

  return verifyToken(token)
}

export const setAuthCookie = (token: string): string => {
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
}

export const clearAuthCookie = (): string => {
  return `auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
}
