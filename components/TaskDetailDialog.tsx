'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { Task } from '@/lib/validation'
import { parseLocalDateFromYMD } from '@/lib/time'

interface TaskDetailDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  clientName?: string
  assigneeName?: string
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  clientName = 'Sin cliente',
  assigneeName = 'Sin asignar'
}: TaskDetailDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200'
      case 'inprogress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'todo': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'backlog': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return 'Completado'
      case 'inprogress': return 'En Progreso'
      case 'todo': return 'Por Hacer'
      case 'review': return 'Revisión'
      case 'backlog': return 'Backlog'
      default: return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente'
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return priority
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'inprogress': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'todo': return <Clock className="h-5 w-5 text-blue-600" />
      case 'review': return <Clock className="h-5 w-5 text-purple-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon(task.status)}
            <span>Detalles de la Tarea</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          </div>

          {/* Cliente */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="text-sm font-medium text-gray-900">{clientName}</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Descripción</p>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {task.description_md || 'Sin descripción'}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Estado */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                {getStatusIcon(task.status)}
              </div>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <Badge className={`${getStatusColor(task.status)} text-xs`}>
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
            </div>

            {/* Prioridad */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Prioridad</p>
                <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
            </div>

            {/* Asignado */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Asignado a</p>
                <p className="text-sm font-medium text-gray-900">{assigneeName}</p>
              </div>
            </div>

            {/* Fecha */}
            {task.due_date && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha de entrega</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseLocalDateFromYMD(task.due_date).toLocaleDateString('es-ES', { 
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Horas estimadas */}
          {task.estimate_hours && (
            <div className="flex items-center space-x-3 pt-2 border-t">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tiempo estimado</p>
                <p className="text-sm font-medium text-gray-900">{task.estimate_hours} horas</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

