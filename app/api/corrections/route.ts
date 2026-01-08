import { NextRequest, NextResponse } from 'next/server'
import { FinanceService } from '@/lib/services/finance'
import { TasksService } from '@/lib/services/tasks'

export const dynamic = 'force-dynamic'

// GET /api/corrections?workspaceId=xxx&month=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const month = searchParams.get('month') || undefined
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const corrections = await FinanceService.listCorrections(workspaceId, month)
    return NextResponse.json(corrections)
  } catch (error) {
    console.error('Error fetching corrections:', error)
    return NextResponse.json({ error: 'Failed to fetch corrections' }, { status: 500 })
  }
}

// Función auxiliar para obtener el nombre del tipo de corrección
function getCorrectionTypeName(type: string): string {
  switch (type) {
    case 'video': return 'Video'
    case 'design': return 'Diseño'
    case 'photo': return 'Fotografía'
    case 'copy': return 'Copy'
    default: return 'Otro'
  }
}

// POST /api/corrections
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.workspace_id || !body.project_id || !body.hours || !body.description || !body.date) {
      return NextResponse.json({ error: 'Missing required fields: workspace_id, project_id, hours, description, date' }, { status: 400 })
    }

    const correction = await FinanceService.createCorrection({
      workspace_id: body.workspace_id,
      project_id: body.project_id,
      user_id: body.user_id,
      correction_type: body.correction_type || 'other',
      hours: parseFloat(body.hours),
      description: body.description,
      date: body.date,
      task_id: body.task_id,
      notes: body.notes
    })

    // Crear una tarea completada automáticamente para que aparezca en la lista
    try {
      const correctionTypeName = getCorrectionTypeName(body.correction_type || 'other')
      await TasksService.createTask({
        project_id: body.project_id,
        title: `🔧 Corrección: ${correctionTypeName}`,
        description_md: body.description + (body.notes ? `\n\nNotas: ${body.notes}` : ''),
        status: 'done', // Marcar como completada
        priority: 'medium',
        assignee_id: body.user_id || undefined,
        due_date: body.date,
        estimate_hours: parseFloat(body.hours)
      })
      console.log('✅ Tarea de corrección creada automáticamente')
    } catch (taskError) {
      // Si falla la creación de la tarea, solo log el error pero no falla la corrección
      console.error('⚠️ Error creando tarea de corrección:', taskError)
    }

    return NextResponse.json(correction)
  } catch (error) {
    console.error('Error creating correction:', error)
    return NextResponse.json({ error: 'Failed to create correction' }, { status: 500 })
  }
}

// PUT /api/corrections
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const correction = await FinanceService.updateCorrection(body.id, {
      project_id: body.project_id,
      user_id: body.user_id,
      correction_type: body.correction_type,
      hours: body.hours !== undefined ? parseFloat(body.hours) : undefined,
      description: body.description,
      date: body.date,
      task_id: body.task_id,
      notes: body.notes
    })

    return NextResponse.json(correction)
  } catch (error) {
    console.error('Error updating correction:', error)
    return NextResponse.json({ error: 'Failed to update correction' }, { status: 500 })
  }
}

// DELETE /api/corrections?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await FinanceService.deleteCorrection(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting correction:', error)
    return NextResponse.json({ error: 'Failed to delete correction' }, { status: 500 })
  }
}

