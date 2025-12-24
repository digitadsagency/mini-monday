'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, AlertCircle, Search } from 'lucide-react'
import { CorrectionRecord, CorrectionType } from '@/lib/services/finance'

interface CorrectionFormDialogProps {
  workspaceId: string
  onCorrectionCreated: (correction: CorrectionRecord) => void
  trigger?: React.ReactNode
}

export function CorrectionFormDialog({ workspaceId, onCorrectionCreated, trigger }: CorrectionFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [projectId, setProjectId] = useState('')
  const [userId, setUserId] = useState('')
  const [correctionType, setCorrectionType] = useState<CorrectionType>('other')
  const [hours, setHours] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  // Load clients and users when dialog opens
  useEffect(() => {
    const loadData = async () => {
      if (!open) return
      
      setLoadingData(true)
      try {
        const [clientsRes, usersRes] = await Promise.all([
          fetch(`/api/projects?workspaceId=${workspaceId}`),
          fetch('/api/users')
        ])
        
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          // Clientes activos y por sesión (no pausados ni completados)
          setClients(clientsData.filter((c: any) => c.status === 'active' || c.status === 'por_sesion'))
        }
        
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [open, workspaceId])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setProjectId('')
    setUserId('')
    setCorrectionType('other')
    setHours('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectId || !hours || !description) {
      alert('Por favor completa los campos requeridos: Cliente, Horas y Descripción')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          project_id: projectId,
          user_id: userId || undefined,
          correction_type: correctionType,
          hours: parseFloat(hours),
          description,
          date,
          notes: notes || undefined
        })
      })

      if (response.ok) {
        const correction = await response.json()
        onCorrectionCreated(correction)
        resetForm()
        setOpen(false)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'No se pudo crear la corrección'}`)
      }
    } catch (error) {
      console.error('Error creating correction:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = clients.find(c => c.id === projectId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
            <AlertCircle className="h-4 w-4 mr-2" />
            Registrar Corrección
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span>Registrar Corrección</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente con buscador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            
            {!projectId ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {loadingData ? (
                    <div className="p-3 text-center text-gray-500">Cargando...</div>
                  ) : filteredClients.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">No hay clientes</div>
                  ) : (
                    filteredClients.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setProjectId(client.id)
                          setSearchQuery('')
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                      >
                        <span className="font-medium">{client.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                <span className="font-medium text-orange-900">{selectedClient?.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setProjectId('')}
                  className="text-orange-600 hover:text-orange-800"
                >
                  Cambiar
                </Button>
              </div>
            )}
          </div>

          {/* Tipo de corrección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Corrección
            </label>
            <Select value={correctionType} onValueChange={(v) => setCorrectionType(v as CorrectionType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">🎬 Video</SelectItem>
                <SelectItem value="design">🎨 Diseño</SelectItem>
                <SelectItem value="photo">📷 Foto</SelectItem>
                <SelectItem value="copy">✍️ Copy/Texto</SelectItem>
                <SelectItem value="other">📝 Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Horas de corrección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horas de Corrección <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ej: 1.5"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Tiempo invertido en la corrección</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe qué se corrigió..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              required
            />
          </div>

          {/* Quién hizo la corrección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Realizada por
            </label>
            <Select value={userId || 'none'} onValueChange={(v) => setUserId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona usuario (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas opcionales..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !projectId || !hours || !description}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Guardando...' : 'Registrar Corrección'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

