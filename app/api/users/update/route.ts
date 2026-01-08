import { NextRequest, NextResponse } from 'next/server'
import { getSheetsClient, getSpreadsheetId, getSheetName } from '@/lib/sheets/client'

const USERS_SHEET_NAME = getSheetName('users')

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'email y role son requeridos' },
        { status: 400 }
      )
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = getSpreadsheetId()

    // Buscar el usuario por email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${USERS_SHEET_NAME}!A:G`,
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron usuarios' },
        { status: 404 }
      )
    }

    const headers = rows[0]
    const userRows = rows.slice(1)

    // Encontrar el índice de la columna email y role
    const emailIndex = headers.indexOf('email')
    const roleIndex = headers.indexOf('role')

    if (emailIndex === -1 || roleIndex === -1) {
      return NextResponse.json(
        { error: 'Estructura de la hoja inválida' },
        { status: 500 }
      )
    }

    // Buscar la fila del usuario
    const userRowIndex = userRows.findIndex(row => 
      (row[emailIndex] || '').toLowerCase().trim() === email.toLowerCase().trim()
    )

    if (userRowIndex === -1) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el rol (row index + 2 porque: 1 por el header, 1 porque las filas empiezan en 1)
    const rowNumber = userRowIndex + 2
    const columnLetter = String.fromCharCode(65 + roleIndex) // A=65 en ASCII

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${USERS_SHEET_NAME}!${columnLetter}${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[role]]
      }
    })

    console.log(`✅ Usuario ${email} actualizado a rol ${role}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Rol actualizado a ${role}` 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}
