import { NextRequest, NextResponse } from 'next/server'
import { FinanceService } from '@/lib/services/finance'

export const dynamic = 'force-dynamic'

// GET /api/corrections/summary?workspaceId=xxx&startMonth=YYYY-MM&endMonth=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const startMonth = searchParams.get('startMonth') || undefined
    const endMonth = searchParams.get('endMonth') || undefined
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const summary = await FinanceService.getCorrectionsByClient(workspaceId, startMonth, endMonth)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching corrections summary:', error)
    return NextResponse.json({ error: 'Failed to fetch corrections summary' }, { status: 500 })
  }
}

