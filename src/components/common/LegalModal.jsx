import { useEffect, useRef } from 'react'
import { CheckCircle2, FileText, Scale, ShieldCheck, X } from 'lucide-react'

const LAST_UPDATED = 'Novembro de 2026'

const TERMS_SUMMARY = [
  'Zero comissão sobre pedidos e contrato sem fidelidade ou multa de cancelamento.',
  'Os pagamentos dos pedidos acontecem 100% direto entre o cliente final e a sua loja.',
  'Todas as funcionalidades são liberadas; a mensalidade acompanha apenas a faixa de faturamento mensal.',
]

const PRIVACY_SUMMARY = [
  'Privacidade garantida: a lista de clientes e pedidos da sua loja pertence exclusivamente a você.',
  'Jamais vendemos, alugamos ou disparamos propagandas para os consumidores dos restaurantes.',
  'Não guardamos dados de cartões de crédito nem rastreamos a localização em tempo real.',
]

const TERMS_SECTIONS = [
  {
    number: '01',
    title: 'Aceitação e Objeto da Plataforma',
    paragraphs: [
      'Estes Termos de Uso regulam a utilização do sistema online NumInstante por restaurantes, lanchonetes, pizzarias e demais estabelecimentos parceiros ("Lojista"), bem como o uso do cardápio digital pelos seus respectivos consumidores ("Cliente Final").',
      'O NumInstante disponibiliza ferramentas digitais de cardápio online direto no navegador, painel de acompanhamento de pedidos em tempo real, frente de caixa (PDV), impressão de comandas e controle básico de vendas.',
      'O NumInstante atua estritamente como fornecedor do sistema, não preparando alimentos, não intermediando pagamentos de vendas e não realizando entregas. Não há vínculo societário, trabalhista ou responsabilidade solidária entre o NumInstante e a operação comercial do Lojista.',
    ],
  },
  {
    number: '02',
    title: 'Autonomia e Responsabilidades do Lojista',
    paragraphs: [
      'O Lojista tem total controle sobre sua vitrine digital e responde exclusivamente perante seus consumidores e órgãos de fiscalização por:',
    ],
    bullets: [
      'Veracidade das informações de produtos, ingredientes, adicionais, preços, promoções, cupons e taxas de entrega cadastradas.',
      'Qualidade sanitária, higiene no preparo, armazenamento, embalagem e transporte seguro dos alimentos e bebidas.',
      'Cumprimento dos horários de funcionamento, prazos estimados de preparo, retirada no balcão ou entrega em domicílio.',
      'Emissão de comprovantes ou notas fiscais aplicáveis ao seu negócio, além do cuidado com seu e-mail e senha de acesso ao painel.',
    ],
  },
  {
    number: '03',
    title: 'Diretrizes de Conteúdo e Produtos Restritos',
    paragraphs: [
      'Para manter um ambiente seguro e dentro da lei brasileira, o Lojista compromete-se a não utilizar o sistema para práticas ilegais ou que violem normas sanitárias:',
    ],
    bullets: [
      'Produtos Proibidos (ANVISA): É expressamente proibido cadastrar, exibir ou vender produtos fumígenos derivados ou não do tabaco (como cigarros, charutos, narguilés e cigarros eletrônicos/vapes), medicamentos controlados ou produtos ilícitos.',
      'Bebidas Alcoólicas (+18): A venda de bebidas alcoólicas exige aviso claro de proibição para menores de 18 anos no cardápio, cabendo ao Lojista e ao seu entregador conferir a maioridade no momento da entrega ou retirada.',
      'Direitos de Imagem: Ao enviar logotipos, banners e fotos próprias, o Lojista declara possuir direito de uso dessas imagens. As fotos fornecidas pelo banco de imagens do NumInstante são liberadas apenas para uso dentro do cardápio na plataforma.',
    ],
    footerNote:
      'Caso seja identificada violação legal ou denúncia comprovada, o NumInstante poderá ocultar o item irregular ou suspender temporariamente a conta para verificação.',
  },
  {
    number: '04',
    title: 'Pagamentos dos Pedidos e Isenção Financeira',
    paragraphs: [
      'O NumInstante não cobra comissão sobre as vendas e não faz intermediação financeira nas compras realizadas pelos Clientes Finais.',
      'Todos os pagamentos dos pedidos, sejam via PIX direto para a conta do restaurante, cartões na maquininha presencial ou dinheiro, acontecem diretamente entre o Cliente Final e o Lojista. Cabe exclusivamente ao estabelecimento conferir comprovantes, calcular troco e resolver eventuais pedidos de estorno ou cancelamento direto com o consumidor.',
    ],
  },
  {
    number: '05',
    title: 'Planos por Faixa de Faturamento, Cobrança e Tolerância',
    paragraphs: [
      'O NumInstante libera todas as funções do sistema em qualquer faixa, definindo o valor mensal apenas conforme o total de pedidos concluídos pela loja dentro da plataforma a cada mês:',
    ],
    bullets: [
      'Faixa 1 • Impulso Inicial (Até R$ 2.500,00/mês): Mensalidade 100% Gratuita (R$ 0,00).',
      'Faixa 2 • Crescimento (De R$ 2.501,00 até R$ 6.000,00/mês): Mensalidade fixa de R$ 49,90/mês.',
      'Faixa 3 • Alta Escala (Acima de R$ 6.000,00/mês): Mensalidade teto fixa de R$ 89,90/mês.',
      'Configuração Assistida (Opcional): Serviço avulso de montagem inicial completa do cardápio (online ou presencial) mediante taxa única combinada previamente com o Lojista.',
    ],
    footerNote:
      'Apuração e Atraso: O fechamento é calculado ao final de cada mês. Caso uma mensalidade aplicável não seja paga até o vencimento, o Lojista terá até 5 (cinco) dias corridos de tolerância, recebendo aviso da nossa equipe. Persistindo a pendência após o 5º dia, o painel e o cardápio poderão ficar temporariamente pausados até a regularização, sem perda de nenhum produto ou dado cadastrado. Eventuais reajustes futuros de planos serão avisados com pelo menos 30 dias de antecedência.',
  },
  {
    number: '06',
    title: 'Vigência, Cancelamento Livre e Arrependimento',
    paragraphs: [
      'A parceria funciona por prazo indeterminado, sem fidelidade e sem multa de cancelamento. O Lojista pode pedir o encerramento da assinatura quando quiser pelo WhatsApp oficial de suporte, com conclusão em até 1 (um) dia útil.',
      'Conforme o Código de Defesa do Consumidor (art. 49), novas assinaturas pagas contratadas pela internet contam com prazo de arrependimento de 7 (sete) dias corridos após o primeiro pagamento, com reembolso integral da mensalidade. No caso da Configuração Assistida opcional, se o trabalho de cadastro do cardápio já tiver sido concluído e entregue a pedido imediato do Lojista, a taxa remunera o serviço já prestado.',
    ],
  },
  {
    number: '07',
    title: 'Funcionamento do Sistema e Direitos sobre a Marca',
    paragraphs: [
      'O NumInstante trabalha continuamente para manter o sistema estável e disponível, podendo realizar melhorias e manutenções periódicas. A plataforma não se responsabiliza por interrupções causadas por queda de internet ou energia no restaurante, defeitos em aparelhos ou impressoras do próprio estabelecimento, nem por instabilidades em serviços externos (como operadoras de telefone, WhatsApp ou sistema PIX do Banco Central).',
      'O sistema, o visual da plataforma e a marca NumInstante são protegidos por lei, recebendo o Lojista o direito de utilizá-los enquanto sua conta estiver ativa. Já o nome, logotipo, fotos próprias e receitas cadastradas pelo restaurante continuam sendo de propriedade exclusiva do Lojista.',
    ],
  },
  {
    number: '08',
    title: 'Atualizações, Contato Oficial e Foro',
    paragraphs: [
      'Estes Termos podem ser atualizados periodicamente para acompanhar novas funcionalidades ou exigências legais, mantendo sempre a clareza com os parceiros.',
      'Para dúvidas, suporte no dia a dia ou solicitações comerciais, nosso atendimento humano funciona pelo WhatsApp oficial (84) 99433-4789.',
      'Fica definido o Foro da Comarca de Nova Cruz, Estado do Rio Grande do Norte, para resolver eventuais questões ligadas a estes Termos, respeitadas as normas legais aplicáveis.',
    ],
  },
]

const PRIVACY_SECTIONS = [
  {
    number: '01',
    title: 'Papel de Cada Parte na Lei de Proteção de Dados (LGPD)',
    paragraphs: [
      'Esta Política de Privacidade explica de forma simples como o NumInstante cuida das informações pessoais, seguindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD) e o Marco Civil da Internet.',
      'Em um sistema de cardápio digital, a responsabilidade sobre os dados funciona assim:',
    ],
    bullets: [
      'Dados da Loja (NumInstante como Controlador): Cuidamos diretamente dos dados cadastrais dos Lojistas parceiros para manter a conta ativa, prestar suporte e gerir o plano.',
      'Dados dos Pedidos (Restaurante como Controlador e NumInstante como Operador): Os dados informados pelos Clientes Finais na hora da compra pertencem ao relacionamento comercial do restaurante. O NumInstante apenas registra e organiza essas informações para que o pedido chegue corretamente à loja.',
    ],
  },
  {
    number: '02',
    title: 'Quais Informações Coletamos',
    paragraphs: [
      'Solicitamos apenas os dados necessários para o funcionamento da loja e a entrega correta dos pedidos:',
    ],
    bullets: [
      'Dados do Lojista: Nome do responsável, nome da loja ou razão social, CNPJ ou CPF, e-mail de login, senha protegida por criptografia, telefone/WhatsApp comercial, endereço do estabelecimento e histórico de vendas.',
      'Dados do Cliente Final no Pedido: Nome, telefone/WhatsApp, endereço de entrega (rua, número, bairro, complemento e ponto de referência, quando o pedido for para entrega), itens escolhidos, observações, forma de pagamento e avaliações deixadas pelo cliente.',
      'Registros Básicos de Segurança: Data, horário e identificação da conexão de internet (IP), guardados conforme exigência da legislação brasileira para prevenção de fraudes.',
    ],
  },
  {
    number: '03',
    title: 'Como Usamos os Dados e Sigilo entre Lojas',
    paragraphs: [
      'As informações registradas no sistema são usadas exclusivamente para:',
    ],
    bullets: [
      'Enviar o pedido imediatamente ao painel do restaurante, formatar a comanda de impressão e permitir os avisos de andamento pelo WhatsApp.',
      'Mostrar relatórios de vendas e faturamento restritos ao próprio dono da loja.',
      'Exibir as notas e avaliações dos clientes no topo do cardápio da respectiva loja.',
      'Oferecer suporte humano e calcular a faixa mensal do plano da loja.',
    ],
    footerNote:
      'Compromisso de Sigilo: As informações de cada restaurante ficam totalmente separadas dentro do sistema. O NumInstante não vende listas de contatos, não compartilha clientes entre lojas concorrentes e não envia propagandas aos consumidores finais.',
  },
  {
    number: '04',
    title: 'Onde os Dados Ficam Salvos, Cookies e Segurança',
    paragraphs: [
      'Todos os dados cadastrais do Lojista, produtos, configurações da loja e histórico de pedidos ficam salvos com segurança em nosso banco de dados em servidores protegidos, acessíveis pelo restaurante mediante autenticação com login e senha.',
      'Todas as comunicações e trocas de dados entre o seu dispositivo e a plataforma trafegam protegidas por criptografia (protocolo HTTPS/TLS), impedindo o acesso ou interceptação por terceiros não autorizados.',
      'Utilizamos cookies estritamente técnicos e recursos de memória local do navegador para manter a sessão do lojista conectada e garantir agilidade ao consumidor: para o Cliente Final que acessa o cardápio digital, o sistema guarda no navegador do próprio celular ou computador os itens da sacola e os dados preenchidos na primeira compra (nome, telefone, data de aniversário e cpf opcional). Isso serve unicamente para que ele não precise digitar tudo de novo nos próximos pedidos, sem exigir criação de conta ou senha, podendo ser apagado a qualquer momento ao limpar os dados do navegador.',
    ],
  },
  {
    number: '05',
    title: 'Suporte Autorizado e Compartilhamento',
    paragraphs: [
      'Quando o próprio Lojista solicitar ajuda no atendimento ou contratar a Configuração Assistida, nossa equipe poderá acessar o painel da loja exclusivamente para realizar os ajustes pedidos, mantendo total sigilo sobre as informações.',
      'Fora isso, os dados só são processados pelos serviços essenciais de hospedagem que mantêm o sistema funcionando na internet ou caso haja alguma determinação judicial.',
    ],
  },
  {
    number: '06',
    title: 'Direitos do Titular dos Dados (LGPD) e Contato',
    paragraphs: [
      'Nos termos do artigo 18 da Lei Geral de Proteção de Dados (LGPD), qualquer titular tem o direito de confirmar a existência de tratamento, acessar seus dados pessoais, solicitar a correção de informações incompletas ou requerer a anonimização, bloqueio ou exclusão de dados desnecessários, respeitados os prazos de guarda legalmente obrigatórios, como os registros de conexão estabelecidos pelo Marco Civil da Internet (Lei nº 12.965/2014) e as obrigações fiscais do estabelecimento comercial.',
      'Caso você seja Cliente Final de um restaurante parceiro, recomendamos solicitar alterações ou exclusão diretamente ao estabelecimento onde realizou o pedido, na qualidade de Controlador comercial, permanecendo nossa equipe sempre à disposição para orientar e apoiar.',
      'Canal Oficial de Privacidade e Proteção de Dados: WhatsApp (84) 99433-4789, Nova Cruz/RN.',
    ],
  },
]

export function LegalModal({ activeTab, onTabChange, onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!activeTab) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, onClose])

  if (!activeTab) return null

  const isTerms = activeTab === 'terms'
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS
  const summaryItems = isTerms ? TERMS_SUMMARY : PRIVACY_SUMMARY

  const handleSwitchTab = (tab) => {
    onTabChange(tab)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-modal-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#E9ECEF] max-w-3xl w-full max-h-[90dvh] sm:max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho Fixo com Seletor de Abas */}
        <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-[#E9ECEF] bg-white shrink-0 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFF4EE] text-[#FF5E1E] flex items-center justify-center shrink-0 border border-orange-200/70">
                {isTerms ? <Scale className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3
                  id="legal-modal-title"
                  className="text-lg sm:text-xl font-black text-[#1A1D20] leading-tight"
                >
                  {isTerms ? 'Termos de Uso da Plataforma' : 'Política de Privacidade (LGPD)'}
                </h3>
                <p className="text-xs text-[#6C757D] font-semibold mt-0.5">
                  NumInstante Delivery • Última atualização: {LAST_UPDATED}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar janela"
              className="p-2 rounded-xl text-[#6C757D] hover:text-[#1A1D20] hover:bg-[#F8F9FA] border border-transparent hover:border-[#E9ECEF] transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Abas Alternadoras (Termos | Privacidade) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
            <button
              type="button"
              onClick={() => handleSwitchTab('terms')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isTerms
                  ? 'bg-white text-[#FF5E1E] shadow-xs border border-[#E9ECEF]'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Termos de Uso</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('privacy')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isTerms
                  ? 'bg-white text-[#FF5E1E] shadow-xs border border-[#E9ECEF]'
                  : 'text-[#6C757D] hover:text-[#1A1D20]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Privacidade (LGPD)</span>
            </button>
          </div>
        </div>

        {/* Corpo com Rolagem Suave e Alta Legibilidade */}
        <div
          ref={scrollRef}
          className="px-5 sm:px-7 py-5 sm:py-6 overflow-y-auto space-y-6 text-sm text-[#4A5568] leading-relaxed"
        >
          {/* Box de Resumo Transparente (Legal Design) */}
          <div className="rounded-2xl bg-[#FFF8F5] border border-orange-200/80 p-4 sm:p-5 space-y-2.5">
            <p className="text-xs font-black uppercase tracking-wider text-[#FF5E1E]">
              Resumo Transparente (Sem Letras Miúdas)
            </p>
            <ul className="space-y-2">
              {summaryItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13px] sm:text-sm font-semibold text-[#1A1D20]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Seções Numeradas */}
          <div className="space-y-6">
            {sections.map((sec) => (
              <section key={sec.number} className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-[#1A1D20]">
                    {sec.number}
                  </span>
                  <h4 className="text-base sm:text-[17px] font-black text-[#1A1D20]">
                    {sec.title}
                  </h4>
                </div>

                <div className="space-y-2.5 pl-0 sm:pl-9">
                  {sec.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm text-[#4A5568] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}

                  {sec.bullets && (
                    <ul className="space-y-2 pt-1">
                      {sec.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 text-sm text-[#343A40] bg-[#F8F9FA] p-3 rounded-xl border border-[#E9ECEF]/80"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1E] shrink-0 mt-2" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.footerNote && (
                    <p className="text-[13px] sm:text-xs font-semibold text-[#4A5568] bg-slate-50 border-l-3 border-[#FF5E1E] pl-3.5 py-2 rounded-r-xl">
                      {sec.footerNote}
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Rodapé Fixo do Modal */}
        <div className="px-5 sm:px-7 py-4 border-t border-[#E9ECEF] bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <a
            href="https://wa.me/5584994334789?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20os%20Termos%20de%20Uso%20e%20Privacidade%20do%20NumInstante."
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-xs font-bold text-[#4A5568] hover:text-[#FF5E1E] transition-colors text-center sm:text-left"
          >
            Ficou com alguma dúvida? <span className="underline font-extrabold">Fale com nossa equipe no WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="btn-hover-zoom w-full sm:w-auto px-6 py-3.5 sm:py-2.5 rounded-2xl sm:rounded-xl bg-[#1A1D20] hover:bg-[#FF5E1E] text-white text-sm font-black transition-colors cursor-pointer"
          >
            Entendi e Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
