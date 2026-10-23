import { Printer, X } from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

export function ThermalReceiptModal({ order, onClose }) {
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const isDelivery = order.deliveryMethod === 'delivery'
  const paymentLabels = {
    pix: 'PIX',
    credit: 'Cartão de Crédito (Maquininha)',
    debit: 'Cartão de Débito (Maquininha)',
    money: 'Dinheiro',
  }

  const formattedDate = order.createdAt || 'Registrado hoje'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E9ECEF] flex flex-col max-h-[90vh] print:max-w-none print:w-full print:border-none print:shadow-none print:p-0">
        {/* Cabeçalho do Modal (Oculto na impressão) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF] shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5E1E] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1A1D20]">Comanda de Produção</h3>
              <p className="text-[11px] text-[#6C757D]">Impressão térmica (80mm)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-200 text-[#6C757D] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual da Comanda Térmica (Scroll se necessário) */}
        <div className="overflow-y-auto my-4 p-4 bg-[#F8F9FA] rounded-2xl border border-dashed border-[#CBD5E1] font-mono text-xs text-[#1A1D20] space-y-3 print:bg-white print:border-none print:p-0 print:m-0">
          <div className="text-center space-y-0.5 border-b border-dashed border-[#CBD5E1] pb-3">
            <h4 className="font-black text-sm tracking-wider uppercase">
              {order.storeName || 'BRASA BURGER'}
            </h4>
            <p className="text-[10px] text-[#6C757D]">
              {isDelivery ? 'PEDIDO PARA ENTREGA' : 'RETIRADA NO BALCÃO'}
            </p>
            <p className="text-base font-black text-[#1A1D20] mt-1">{order.orderId}</p>
            <p className="text-[10px] text-[#6C757D]">
              Data: {formattedDate}
            </p>
          </div>

          {/* Dados do Cliente */}
          <div className="border-b border-dashed border-[#CBD5E1] pb-2 space-y-0.5 text-[11px]">
            <p>
              <strong className="font-bold">Cliente:</strong> {order.customer?.name || 'Cliente'}
            </p>
            {order.customer?.phone && (
              <p>
                <strong className="font-bold">Telefone:</strong> {order.customer.phone}
              </p>
            )}
            {isDelivery && order.address && (
              <div className="pt-1">
                <p className="font-bold">Endereço de Entrega:</p>
                <p>
                  {order.address.street}, {order.address.number}
                </p>
                <p>Bairro: {order.address.neighborhoodName || 'Não especificado'}</p>
                {order.address.complement && <p>Comp: {order.address.complement}</p>}
              </div>
            )}
          </div>

          {/* Itens do Pedido */}
          <div className="border-b border-dashed border-[#CBD5E1] pb-2 space-y-2">
            <p className="font-bold text-[11px] uppercase tracking-wide">Itens do Pedido:</p>
            {(order.items || []).map((item, idx) => {
              const itemNotes = item.observation || item.notes
              const rawOptions =
                Array.isArray(item.options) && item.options.length > 0
                  ? item.options.map((opt) =>
                      typeof opt === 'string'
                        ? opt
                        : opt.name && opt.name !== 'Opção' && opt.name !== 'Adicional'
                        ? `${opt.name}: ${opt.value}`
                        : opt.value || opt.name || ''
                    )
                  : [
                      ...(Array.isArray(item.preferences)
                        ? item.preferences.map((p) =>
                            p.groupName ? `${p.groupName}: ${p.name}` : p.name
                          )
                        : []),
                      ...(Array.isArray(item.addons)
                        ? item.addons.map(
                            (a) => `${a.name}${a.price ? ` (+${formatCurrency(a.price)})` : ''}`
                          )
                        : []),
                    ]

              const optionsList = Array.from(new Set(rawOptions.filter(Boolean)))

              return (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.quantity}x {item.name || item.product?.name}
                    </span>
                    <span>
                      {formatCurrency(
                        item.totalPrice ?? (item.price || item.unitPrice || 0) * (item.quantity || 1)
                      )}
                    </span>
                  </div>
                  {/* Opções e Adicionais */}
                  {optionsList.length > 0 && (
                    <div className="pl-2 text-[10px] text-[#475569] font-medium space-y-0.5">
                      {optionsList.map((optText, oIdx) => (
                        <p key={oIdx}>• {optText}</p>
                      ))}
                    </div>
                  )}
                  {/* Observações do Item */}
                  {itemNotes && (
                    <p className="pl-2 text-[10px] font-bold text-amber-900 bg-amber-50 p-1 rounded mt-0.5 border border-amber-200">
                      OBS: {itemNotes}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Totais */}
          <div className="border-b border-dashed border-[#CBD5E1] pb-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal || order.total || 0)}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between">
                <span>Taxa de Entrega:</span>
                <span>{formatCurrency(order.deliveryFee || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm pt-1 border-t border-dashed border-[#E2E8F0]">
              <span>TOTAL:</span>
              <span>{formatCurrency(order.total || 0)}</span>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="text-[11px] space-y-0.5">
            <p className="font-bold uppercase tracking-wide">Pagamento:</p>
            <p className="font-bold text-emerald-700">
              {paymentLabels[order.paymentMethod] || order.paymentMethod?.toUpperCase() || 'PIX'}
            </p>
            {order.paymentMethod === 'money' && order.changeFor > 0 && (
              <p className="text-[10px] text-[#6C757D]">
                Levar troco para: {formatCurrency(order.changeFor)} (Troco:{' '}
                {formatCurrency(Math.max(0, order.changeFor - order.total))})
              </p>
            )}
            {order.paymentMethod === 'pix' && order.pix && (
              <p className="text-[10px] text-[#6C757D]">
                Titular PIX: {order.pix.beneficiary || 'Brasa Burger'}
              </p>
            )}
          </div>

          <div className="text-center pt-2 text-[10px] text-[#94A3B8]">
            *** Obrigado pela preferência! ***
          </div>
        </div>

        {/* Rodapé com Botão Imprimir (Oculto na impressão) */}
        <div className="pt-2 flex items-center justify-end gap-2 shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E9ECEF] hover:bg-slate-100 text-[#6C757D] font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#FF5E1E] hover:bg-[#E64E12] text-white font-bold text-xs shadow-md shadow-[#FF5E1E]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda</span>
          </button>
        </div>
      </div>
    </div>
  )
}
