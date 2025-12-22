'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Task } from '@/lib/validation'

// Schema for the edit form
const TaskEditSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['backlog', 'todo', 'inprogress', 'review', 'done']).default('todo'),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  estimate_hours: z.number().positive('Las horas deben ser positivas').optional().nullable(),
})

type TaskEditData = z.infer<typeof TaskEditSchema>

interface TaskEditDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: (task: Task) => void
  users?: any[]
  clients?: any[]
}

export function TaskEditDialog({ 
  task, 
  open, 
  onOpenChange, 
  onTaskUpdated,
  users = [],
  clients = []
}: TaskEditDialogProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TaskEditData>({
    resolver: zodResolver(TaskEditSchema),
    defaultValues: {
      title: task.title || '',
      description: task.description_md || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assignee_id: task.assignee_id || 'unassigned',
      due_date: task.due_date || '',
      estimate_hours: task.estimate_hours || undefined,
    }
  })

  // Reset form when task changes
  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title || '',
        description: task.description_md || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        assignee_id: task.assignee_id || 'unassigned',
        due_date: task.due_date || '',
        estimate_hours: task.estimate_hours || undefined,
      })
    }
  }, [task, open, reset])

  const onSubmit = async (data: TaskEditData) => {
    setLoading(true)
    try {
      const requestData = {
        title: data.title.trim(),
        description_md: (data.description || '').trim(),
        priority: data.priority,
        status: data.status,
        assignee_id: data.assignee_id === 'unassigned' ? '' : (data.assignee_id || ''),
        due_date: data.due_date || '',
        estimate_hours: data.estimate_hours || undefined
      }

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTaskUpdated(updatedTask)
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        console.error('Error updating task:', errorData)
        alert(`❌ Error al actualizar la tarea: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert('❌ Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Get client name
  const getClientName = () => {
    const client = clients.find(c => c.id === task.project_id)
    return client?.name || 'Cliente desconocido'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Editar Tarea</span>
          </DialogTitle>
          <p className="text-sm text-gray-500">Cliente: {getClientName()}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="Título de la tarea"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              {...register('description')}
              placeholder="Descripción de la tarea"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <Select
                onValueChange={(value) => setValue('status', value as any)}
                value={watch('status')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">Por Hacer</SelectItem>
                  <SelectItem value="inprogress">En Progreso</SelectItem>
                  <SelectItem value="review">En Revisión</SelectItem>
                  <SelectItem value="done">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <Select
                onValueChange={(value) => setValue('priority', value as any)}
                value={watch('priority')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignar a
            </label>
            <Select
              onValueChange={(value) => setValue('assignee_id', value)}
              value={watch('assignee_id') || 'unassigned'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un miembro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span>{user.name || user.username || 'Usuario'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento
              </label>
              <Input
                type="date"
                {...register('due_date')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimado de Horas
              </label>
              <Input
                type="number"
                {...register('estimate_hours', { valueAsNumber: true })}
                placeholder="Ej: 8"
                min="0"
                step="0.5"
                className={errors.estimate_hours ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

