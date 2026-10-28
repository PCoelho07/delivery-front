import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { CartBottomBar } from '../../components/cart/CartBottomBar'
import { CartModal } from '../../components/cart/CartModal'
import { CheckoutModal } from '../../components/checkout/CheckoutModal'
import { OrderConfirmationModal } from '../../components/checkout/OrderConfirmationModal'
import { CategoryTabs } from '../../components/menu/CategoryTabs'
import { ProductCard } from '../../components/menu/ProductCard'
import { ProductDetailsModal } from '../../components/menu/ProductDetailsModal'
import { StoreHeader } from '../../components/menu/StoreHeader'
import { StoreInfoModal } from '../../components/menu/StoreInfoModal'
import { StoreReviewsModal } from '../../components/menu/StoreReviewsModal'
import { DEFAULT_STORE_PREVIEW } from '../../data/storeTemplateData'
import { useBusinessStore } from '../../store/useBusinessStore'
import { useCartStore } from '../../store/useCartStore'
import { useCustomerStore } from '../../store/useCustomerStore'
import { useStoreAdmin, calculateStoreLiveStatus } from '../../store/useStoreAdmin'
import { useCustomerOrdersRealtime } from '../../hooks/useCustomerOrdersRealtime'

export function CardapioPage() {
  const { businessName } = useParams()
  const { businesses, currentBusiness, products: apiProducts, fetchBusinesses, selectBusinessByName } =
    useBusinessStore()

  // Conexão WebSocket nativa para receber atualizações do pedido e status da loja em tempo real
  useCustomerOrdersRealtime()

  const cartItems = useCartStore((state) => state.items)
  const addItemToCart = useCartStore((state) => state.addItem)
  const replaceCartWithOrderItems = useCartStore(
    (state) => state.replaceCartWithOrderItems
  )
  const setStoreSlug = useCartStore((state) => state.setStoreSlug)

  // Sincroniza a sacola com a loja atual (Multi-carrinho independente por restaurante)
  useEffect(() => {
    const slug = businessName || 'brasa-burger'
    setStoreSlug(slug)
  }, [businessName, setStoreSlug])
  const orders = useCustomerStore((state) => state.orders)
  const customerReviews = useCustomerStore((state) => state.reviews)

  const adminSchedule = useStoreAdmin((state) => state.schedule)
  const adminTimezone = useStoreAdmin((state) => state.timezone)
  const adminStoreStatusMode = useStoreAdmin((state) => state.storeStatusMode)
  const adminStoreInfo = useStoreAdmin((state) => state.storeInfo)
  const adminDeliveryConfig = useStoreAdmin((state) => state.deliveryConfig)
  const adminNeighborhoods = useStoreAdmin((state) => state.neighborhoods)
  const adminPaymentConfig = useStoreAdmin((state) => state.paymentConfig)
  const adminCategories = useStoreAdmin((state) => state.categories)
  const adminProducts = useStoreAdmin((state) => state.products)
  const adminTemplates = useStoreAdmin((state) => state.templates)
  const adminCoupons = useStoreAdmin((state) => state.coupons)

  const liveStatus = useMemo(
    () =>
      calculateStoreLiveStatus(
        adminSchedule,
        adminTimezone,
        adminStoreStatusMode
      ),
    [adminSchedule, adminTimezone, adminStoreStatusMode]
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState(
    DEFAULT_STORE_PREVIEW.categories[0]?.id || ''
  )
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [isCustomerHubOpen, setIsCustomerHubOpen] = useState(false)
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false)
  const [isStoreReviewsOpen, setIsStoreReviewsOpen] = useState(false)

  const scrollContainerRef = useRef(null)
  const stickyNavRef = useRef(null)
  const sectionRefs = useRef({})
  const isProgrammaticScroll = useRef(false)
  const scrollTimeoutRef = useRef(null)

  const cartTotalCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  )
  const cartTotalAmount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.totalPrice, 0),
    [cartItems]
  )

  // Sincronização multi-abas em tempo real (quando admin atualiza status em outra aba)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'delivery-customer-cache-v1') {
        useCustomerStore.persist?.rehydrate?.()
      }
      if (e.key === 'delivery_admin_store_v3') {
        useStoreAdmin.getState().reloadFromStorage?.()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Se houver parâmetro de loja na URL (/:businessName), sincroniza com o estado da API
  useEffect(() => {
    const syncTenant = async () => {
      if (businessName) {
        if (businesses.length === 0) {
          await fetchBusinesses()
        }
        selectBusinessByName(businessName)
      }
    }
    syncTenant()
  }, [businessName, businesses.length, fetchBusinesses, selectBusinessByName])

  // Mescla os dados cadastrados na API / Painel Admin com o template visual do Figma e status ao vivo
  const storeData = useMemo(() => {
    const base = currentBusiness
      ? {
          ...DEFAULT_STORE_PREVIEW,
          name: currentBusiness.name || DEFAULT_STORE_PREVIEW.name,
          shortBrand: currentBusiness.name
            ? currentBusiness.name.split(' ')[0].toUpperCase().slice(0, 8)
            : DEFAULT_STORE_PREVIEW.shortBrand,
          whatsapp: currentBusiness.phone || DEFAULT_STORE_PREVIEW.whatsapp,
        }
      : {
          ...DEFAULT_STORE_PREVIEW,
          name: adminStoreInfo?.name || DEFAULT_STORE_PREVIEW.name,
          subtitle: adminStoreInfo?.subtitle || DEFAULT_STORE_PREVIEW.subtitle,
          minOrder: adminStoreInfo?.minOrder ?? DEFAULT_STORE_PREVIEW.minOrder,
          whatsapp: adminStoreInfo?.whatsapp || DEFAULT_STORE_PREVIEW.whatsapp,
          phone: adminStoreInfo?.phone || DEFAULT_STORE_PREVIEW.phone,
          instagram: adminStoreInfo?.instagram || '@brasaburger',
          instagramUrl: adminStoreInfo?.instagram
            ? (adminStoreInfo.instagram.startsWith('http')
                ? adminStoreInfo.instagram
                : `https://instagram.com/${adminStoreInfo.instagram.replace(/^@/, '')}`)
            : DEFAULT_STORE_PREVIEW.instagramUrl,
          bannerUrl: adminStoreInfo?.bannerUrl || DEFAULT_STORE_PREVIEW.bannerUrl,
          logoUrl: adminStoreInfo?.logoUrl || DEFAULT_STORE_PREVIEW.logoUrl,
          cnpj: adminStoreInfo?.cnpj || '',
          corporateName: adminStoreInfo?.corporateName || '',
        }

    // Categorias dinâmicas alimentadas pelo Backoffice com produtos e complementos
    let categoriesList = base.categories || []
    if (adminCategories?.length > 0 && adminProducts?.length > 0) {
      const activeAdminCats = adminCategories
        .filter((c) => c.status !== 'inactive')
        .sort((a, b) => a.order - b.order)

      const mapped = activeAdminCats.map((cat) => {
        const catItems = adminProducts
          .filter((p) => p.categoryId === cat.id)
          .sort((a, b) => a.order - b.order)
          .map((p) => {
            const tmpl = adminTemplates?.find((t) => t.id === p.templateId)
            const addons = []
            const preferences = []

            if (tmpl && Array.isArray(tmpl.groups)) {
              tmpl.groups.forEach((grp) => {
                if (grp.required) {
                  grp.items?.forEach((it) => {
                    preferences.push({
                      id: it.id,
                      name: it.name,
                      groupName: grp.name,
                      price: it.price || 0,
                    })
                  })
                } else {
                  grp.items?.forEach((it) => {
                    addons.push({
                      id: it.id,
                      name: it.name,
                      price: it.price || 0,
                    })
                  })
                }
              })
            }

            return {
              id: p.id,
              name: p.name,
              categoryId: cat.id,
              description: p.desc || '',
              price: Number(p.price) || 0,
              imageUrl: p.image,
              badge: p.badge || null,
              available: p.available !== false,
              order: p.order || 0,
              addons,
              preferences,
              maxAddons: 5,
            }
          })
          // Padrão iFood: produtos disponíveis no topo, esgotados no fim da categoria
          .sort((a, b) => {
            const aAvail = a.available !== false ? 0 : 1
            const bAvail = b.available !== false ? 0 : 1
            if (aAvail !== bAvail) return aAvail - bAvail
            return (a.order || 0) - (b.order || 0)
          })

        return {
          id: cat.id,
          tabLabel: cat.name,
          sectionTitle: cat.name,
          items: catItems,
        }
      })

      if (mapped.length > 0) {
        categoriesList = mapped
      }
    }

    return {
      ...base,
      categories:
        currentBusiness && apiProducts && apiProducts.length > 0
          ? [
              {
                id: 'cat-api-principal',
                tabLabel: 'Cardápio',
                sectionTitle: 'Produtos Cadastrados na Loja',
                items: apiProducts.map((p, index) => ({
                  id: `api-${p.id}`,
                  name: p.name,
                  categoryId: 'cat-api-principal',
                  description: p.description || '',
                  price: Number(p.price) || 0,
                  imageUrl:
                    p.imageUrl ||
                    p.image_url ||
                    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
                  badge: null,
                  available: true,
                  order: index + 1,
                  addons: [],
                  preferences: [],
                  maxAddons: 5,
                })),
              },
            ]
          : categoriesList,
      coupons: adminCoupons || [],
      isOpen: liveStatus.isOpen,
      statusMode: liveStatus.mode,
      statusBadge: liveStatus.badge,
      todayHours: liveStatus.todayHours || '18:00 às 23:30',
      deliveryConfig: adminDeliveryConfig,
      deliveryPricingMode: adminDeliveryConfig?.pricingMode || 'by_neighborhood',
      fixedDeliveryFee: adminDeliveryConfig?.fixedFee ?? 5.0,
      estimatedDelivery: adminDeliveryConfig?.estimatedDelivery || '40 - 50 min',
      estimatedPickup: adminDeliveryConfig?.estimatedPickup || '20 - 30 min',
      allowPickup: adminDeliveryConfig?.allowPickup ?? true,
      minOrder: adminDeliveryConfig?.minOrder ?? base.minOrder ?? 15.0,
      neighborhoods: adminNeighborhoods || [],
      paymentConfig: adminPaymentConfig,
      acceptedPaymentMethods: adminPaymentConfig?.methods || {
        money: true,
        pix: true,
        credit: true,
        debit: true,
      },
      pix: adminPaymentConfig?.pix || base.pix,
      address:
        adminStoreInfo?.address ||
        currentBusiness?.address ||
        base.address ||
        'Praça Antônio Basílio de Melo, 32, Nova Cruz / RN',
      schedule: adminSchedule,
      reviews: [...(customerReviews || []), ...(base.reviews || [])],
      reviewsCount: (base.reviewsCount || 248) + (customerReviews?.length || 0),
      timezone: adminTimezone,
    }
  }, [
    currentBusiness,
    adminStoreInfo,
    liveStatus,
    adminDeliveryConfig,
    adminNeighborhoods,
    adminPaymentConfig,
    adminSchedule,
    adminTimezone,
    adminCategories,
    adminProducts,
    adminTemplates,
    adminCoupons,
    apiProducts,
    customerReviews,
  ])

  // Filtra categorias e produtos conforme o texto digitado na busca
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const baseCats = storeData.categories || []

    return baseCats
      .map((cat) => {
        const matchingItems = (cat.items || []).filter((item) => {
          if (!query) return true
          return (
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          )
        })

        // Ordenação Padrão iFood: disponíveis no topo, esgotados no fim da lista
        const sortedItems = [...matchingItems].sort((a, b) => {
          const aAvail = a.available !== false ? 0 : 1
          const bAvail = b.available !== false ? 0 : 1
          if (aAvail !== bAvail) return aAvail - bAvail
          return (a.order || 0) - (b.order || 0)
        })

        return {
          ...cat,
          items: sortedItems,
        }
      })
      .filter((cat) => cat.items.length > 0)
  }, [storeData.categories, searchQuery])

  // Clique em uma categoria: marca de laranja e rola suavemente até o tópico abaixo da barra sticky
  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId)
    const container = scrollContainerRef.current
    const targetSection = sectionRefs.current[categoryId]
    const stickyHeight = stickyNavRef.current?.offsetHeight || 110

    if (container && targetSection) {
      isProgrammaticScroll.current = true
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      container.scrollTo({
        top: Math.max(0, targetSection.offsetTop - stickyHeight),
        behavior: 'smooth',
      })

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 600)
    }
  }

  // ScrollSpy: ao rolar a página, atualiza automaticamente a categoria laranja ativa
  const handleScroll = () => {
    if (isProgrammaticScroll.current) return
    const container = scrollContainerRef.current
    if (!container || filteredCategories.length === 0) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const stickyHeight = stickyNavRef.current?.offsetHeight || 110

    if (scrollHeight - scrollTop - clientHeight <= 10) {
      const lastCat = filteredCategories[filteredCategories.length - 1]
      if (lastCat && activeCategoryId !== lastCat.id) {
        setActiveCategoryId(lastCat.id)
      }
      return
    }

    let currentId = filteredCategories[0].id
    for (const cat of filteredCategories) {
      const sectionEl = sectionRefs.current[cat.id]
      if (sectionEl) {
        if (sectionEl.offsetTop - stickyHeight <= scrollTop + 28) {
          currentId = cat.id
        } else {
          break
        }
      }
    }

    if (currentId !== activeCategoryId) {
      setActiveCategoryId(currentId)
    }
  }

  const isStoreClosed = storeData.isOpen === false || storeData.statusMode === 'paused'

  // Ao clicar em um produto da vitrine
  const handleSelectProduct = (product) => {
    if (isStoreClosed) {
      toast.warning(
        storeData.statusMode === 'paused'
          ? 'O restaurante pausou o atendimento no momento e não está aceitando novos pedidos.'
          : 'O restaurante está fechado no momento. Verifique nossos horários de funcionamento.'
      )
      return
    }
    setSelectedProduct(product)
  }

  // Ao adicionar item na Tela 2, salva na sacola e retorna ao cardápio exibindo a barra da Tela 3
  const handleConfirmAddToCart = (cartPayload) => {
    if (isStoreClosed) {
      toast.error('O restaurante está fechado no momento. Não é possível adicionar itens ao carrinho.')
      setSelectedProduct(null)
      return
    }
    addItemToCart(cartPayload)
    setSelectedProduct(null)
  }

  // Da Tela 4 (Sua sacola) avança para a Tela 5 (Finalizar pedido)
  const handleContinueToDelivery = () => {
    if (storeData.statusMode === 'paused') {
      toast.error('O estabelecimento pausou os pedidos temporariamente. Não é possível concluir o pedido agora.')
      return
    }
    if (storeData.isOpen === false) {
      toast.error('O estabelecimento está fechado no momento. Verifique os horários de funcionamento.')
      return
    }
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  // Da Tela 5 (Finalizar pedido) avança para a Tela 6 (Confirmação, PIX, WhatsApp e Histórico)
  const handleOrderConfirmed = (newOrder) => {
    setIsCheckoutOpen(false)
    setConfirmedOrder(newOrder)
    setIsCustomerHubOpen(true)
    toast.success(`Pedido #${newOrder.orderId} confirmado com sucesso!`)
  }

  // Repetir pedido anterior do histórico
  const handleRepeatOrder = (pastOrder) => {
    if (!pastOrder?.items?.length) return
    replaceCartWithOrderItems(pastOrder.items)
    setIsCustomerHubOpen(false)
    setConfirmedOrder(null)
    setIsCartOpen(true)
    toast.success('Itens do pedido anterior adicionados à sua sacola!')
  }

  return (
    <div className="flex-1 min-h-0 w-full bg-[#F8F9FA] flex justify-center overflow-hidden">
      {/* Container Mobile-First centralizado em telas maiores */}
      <div className="w-full max-w-[480px] h-full flex flex-col bg-[#F8F9FA] md:shadow-[0_0_40px_rgba(0,0,0,0.06)] md:border-x md:border-gray-200/60 overflow-hidden">
        {/* Container de Rolagem Unificado */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative scroll-smooth"
        >
          {/* Topo da Loja (Banner, Logo, Nome, Avaliação e Pedido Mínimo) */}
          <StoreHeader
            store={storeData}
            ordersCount={orders.length}
            onOpenCustomerHub={() => {
              setConfirmedOrder(null)
              setIsCustomerHubOpen(true)
            }}
            onOpenStoreInfo={() => setIsStoreInfoOpen(true)}
            onOpenReviews={() => setIsStoreReviewsOpen(true)}
          />

          {/* Bloco Sticky: Barra de Pesquisa + Botões de Categorias sempre visíveis ao rolar */}
          <div
            ref={stickyNavRef}
            className="sticky top-0 z-20 bg-[#F8F9FA]/95 backdrop-blur-xs pt-2 pb-1 transition-shadow"
          >
            <div className="mx-4 relative">
              <Search
                className="w-4 h-4 text-[#FF5E1E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={2.2}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite para buscar um item"
                className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-2xl pl-10 pr-9 py-2.5 text-[13px] text-[#1A1D20] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5E1E] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#1A1D20] cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <CategoryTabs
              categories={filteredCategories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={handleCategoryClick}
            />
          </div>

          {/* Lista de Tópicos e Produtos */}
          <main className="px-4 pb-8 pt-1">
            {filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#6C757D]">
                Nenhum item encontrado para &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredCategories.map((category) => (
                <section
                  key={category.id}
                  ref={(el) => {
                    sectionRefs.current[category.id] = el
                  }}
                  className="mb-5 last:mb-6"
                >
                  <div className="py-2 flex items-center justify-between">
                    <h2 className="text-[18px] font-bold text-[#1A1D20] tracking-tight">
                      {category.sectionTitle}
                    </h2>
                    <span className="text-[12px] text-[#6C757D] font-medium">
                      {category.items.length}{' '}
                      {category.items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <div className="space-y-3 mt-0.5">
                    {category.items.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        isStoreClosed={isStoreClosed}
                        onSelect={handleSelectProduct}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </main>
        </div>

        {/* Tela 3: Barra Inferior Fixa com Resumo da Sacola e Botão "Ver sacola" */}
        <CartBottomBar
          totalAmount={cartTotalAmount}
          totalCount={cartTotalCount}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Tela 2: Detalhes e Personalização do Produto */}
        {selectedProduct && (
          <ProductDetailsModal
            key={selectedProduct.id}
            item={selectedProduct}
            storeName={storeData.name}
            onClose={() => setSelectedProduct(null)}
            onConfirmAdd={handleConfirmAddToCart}
          />
        )}

        {/* Tela 4: Sua Sacola */}
        {isCartOpen && (
          <CartModal
            store={storeData}
            onClose={() => setIsCartOpen(false)}
            onContinueToDelivery={handleContinueToDelivery}
          />
        )}

        {/* Tela 5: Finalizar Pedido */}
        {isCheckoutOpen && (
          <CheckoutModal
            store={storeData}
            onBack={() => {
              setIsCheckoutOpen(false)
              setIsCartOpen(true)
            }}
            onAddMoreItems={() => setIsCheckoutOpen(false)}
            onOrderConfirmed={handleOrderConfirmed}
          />
        )}

        {/* Tela 6: Confirmação do Pedido + PIX + WhatsApp + Meu Perfil + Últimos Pedidos */}
        {isCustomerHubOpen && (
          <OrderConfirmationModal
            activeOrder={confirmedOrder}
            store={storeData}
            onBackToMenu={() => {
              setIsCustomerHubOpen(false)
              setConfirmedOrder(null)
            }}
            onRepeatOrder={handleRepeatOrder}
          />
        )}

        {/* Modal de Informações da Loja */}
        {isStoreReviewsOpen && (
          <StoreReviewsModal
            isOpen={isStoreReviewsOpen}
            onClose={() => setIsStoreReviewsOpen(false)}
            store={storeData}
            reviews={storeData.reviews}
          />
        )}

        {isStoreInfoOpen && (
          <StoreInfoModal
            isOpen={isStoreInfoOpen}
            onClose={() => setIsStoreInfoOpen(false)}
            store={storeData}
          />
        )}
      </div>
    </div>
  )
}

