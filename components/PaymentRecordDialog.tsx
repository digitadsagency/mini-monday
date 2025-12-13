'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Check } from 'lucide-react'

interface PaymentRecordDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    id?: string
    project_id: string
    billing_id: string
    expected_amount: number
    paid_amount: number
    paid_date: string
    notes?: string
  }) => Promise<void>
  billings: any[]
  projects: any[]
  defaultDate?: string
  defaultBillingId?: string
  editingPayment?: any // Payment record to edit
}

export function PaymentRecordDialog({
  open,
  onClose,
  onSubmit,
  billings,
  projects,
  defaultDate,
  defaultBillingId,
  editingPayment
}: PaymentRecordDialogProps) {
  const [formData, setFormData] = useState({
    billing_id: '',
    paid_amount: '',
    paid_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Actualizar el formulario cuando cambia defaultDate o defaultBillingId, o cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      if (editingPayment) {
        // Modo edición: cargar datos del pago existente
        setFormData({
          billing_id: editingPayment.billing_id || '',
          paid_amount: editingPayment.paid_amount?.toString() || '',
          paid_date: editingPayment.paid_date || new Date().toISOString().split('T')[0],
          notes: editingPayment.notes || ''
        })
      } else {
        // Modo creación: usar valores por defecto
        setFormData({
          billing_id: defaultBillingId || '',
          paid_amount: '',
          paid_date: defaultDate || new Date().toISOString().split('T')[0],
          notes: ''
        })
      }
    }
  }, [open, defaultDate, defaultBillingId, editingPayment])

  const selectedBilling = billings.find(b => b.id === formData.billing_id)
  const selectedProject = projects.find(p => p.id === selectedBilling?.project_id)

  // Filtrar billings por búsqueda
  const filteredBillings = useMemo(() => {
    if (!searchQuery.trim()) return billings
    
    const query = searchQuery.toLowerCase().trim()
    return billings.filter(billing => {
      const project = projects.find(p => p.id === billing.project_id)
      const projectName = (project?.name || '').toLowerCase()
      return projectName.includes(query)
    })
  }, [billings, projects, searchQuery])

  // Limpiar búsqueda cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setSearchQuery('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBilling) return

    setSubmitting(true)
    try {
      await onSubmit({
        id: editingPayment?.id,
        project_id: selectedBilling.project_id,
        billing_id: formData.billing_id,
        expected_amount: selectedBilling.monthly_amount,
        paid_amount: Number(formData.paid_amount),
        paid_date: formData.paid_date,
        notes: formData.notes
      })
      setFormData({
        billing_id: '',
        paid_amount: '',
        paid_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      onClose()
    } catch (error) {
      console.error('Error submitting payment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingPayment ? 'Editar Pago Recibido' : 'Registrar Pago Recibido'}</DialogTitle>
          <DialogDescription>
            {editingPayment ? 'Edita los datos del pago recibido' : 'Registra un pago recibido de un cliente'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="billing_id">Cliente</Label>
            {/* Buscador de clientes */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* Lista de clientes filtrados */}
            <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
              {filteredBillings.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  No se encontraron clientes
                </div>
              ) : (
                filteredBillings.map((billing) => {
                  const project = projects.find(p => p.id === billing.project_id)
                  const isSelected = formData.billing_id === billing.id
                  return (
                    <button
                      key={billing.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, billing_id: billing.id })}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                          {project?.name || 'Cliente'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {billing.monthly_amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} • Día {billing.payment_day}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
            {selectedBilling && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✓ Seleccionado: {selectedProject?.name} - Día de pago: {selectedBilling.payment_day}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="paid_date">Fecha de Pago</Label>
            <Input
              id="paid_date"
              type="date"
              value={formData.paid_date}
              onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="paid_amount">Monto Recibido</Label>
            <Input
              id="paid_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              placeholder={selectedBilling?.monthly_amount?.toString() || '0'}
              required
            />
            {selectedBilling && (
              <p className="text-xs text-gray-500 mt-1">
                Monto esperado: {selectedBilling.monthly_amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !formData.billing_id || !formData.paid_amount}>
              {submitting ? (editingPayment ? 'Guardando...' : 'Registrando...') : (editingPayment ? 'Guardar Cambios' : 'Registrar Pago')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

