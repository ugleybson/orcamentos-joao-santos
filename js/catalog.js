/**
 * Catálogo predefinido de serviços para o sistema de orçamentos
 * Adaptado a prestadores de serviços e empresários em nome individual (Portugal)
 */
const DEFAULT_CATALOG = [
  {
    category: "Construção Civil & Obras",
    icon: "fa-hammer",
    items: [
      {
        id: "cc_01",
        description: "Mão de Obra Especializada em Construção / Remodelação",
        unit: "horas",
        price: 18.50,
        vatRate: 23,
        details: "Execução de trabalhos de construção civil por oficial especializado."
      },
      {
        id: "cc_02",
        description: "Pintura de Paredes e Tetos Interiores (2 Demãos)",
        unit: "m²",
        price: 9.50,
        vatRate: 23,
        details: "Preparação de superfícies, lixagem, primário e aplicação de 2 demãos de tinta plástica lavável."
      },
      {
        id: "cc_03",
        description: "Assentamento de Pavimento Cerâmico / Vinílico",
        unit: "m²",
        price: 16.00,
        vatRate: 23,
        details: "Regularização de piso, aplicação de cola cimentícia e betumação de juntas."
      },
      {
        id: "cc_04",
        description: "Instalação de Divisórias em Gesso Cartonado (Pladur)",
        unit: "m²",
        price: 24.00,
        vatRate: 23,
        details: "Estrutura metálica, placas de gesso com tratamento de juntas e isolamento acústico em lã de rocha."
      },
      {
        id: "cc_05",
        description: "Remoção de Entulho e Transporte para Vazadouro Autorizado",
        unit: "viagem",
        price: 95.00,
        vatRate: 23,
        details: "Carga manual de resíduos de demolição e transporte com guia de resíduos."
      }
    ]
  },
  {
    category: "Eletricidade, Canalização & Instalações",
    icon: "fa-bolt",
    items: [
      {
        id: "inst_01",
        description: "Ponto de Luz ou Tomada Elétrica (Novo / Substituição)",
        unit: "unid",
        price: 35.00,
        vatRate: 23,
        details: "Passagem de cablagem, fixação de caixa de aparelhagem e ligação do mecanismo."
      },
      {
        id: "inst_02",
        description: "Revisão / Instalação de Quadro Elétrico Monofásico",
        unit: "unid",
        price: 180.00,
        vatRate: 23,
        details: "Montagem de disjuntores diferenciais e magnetotérmicos de proteção com barramentos."
      },
      {
        id: "inst_03",
        description: "Substituição de Canalização de Águas Sanitárias",
        unit: "metro",
        price: 28.00,
        vatRate: 23,
        details: "Tubagem multicamada ou PPR soldada com acessórios e fixações adequadas."
      },
      {
        id: "inst_04",
        description: "Instalação de Louças Sanitárias (Sanita / Lavatório / Base de Duche)",
        unit: "unid",
        price: 65.00,
        vatRate: 23,
        details: "Fixação e vedação estanque com silicone antialgas e ligação a esgotos."
      }
    ]
  },
  {
    category: "Tecnologia, Web & Suporte Técnico",
    icon: "fa-laptop-code",
    items: [
      {
        id: "tech_01",
        description: "Desenvolvimento de Website Institucional / Landing Page",
        unit: "projeto",
        price: 650.00,
        vatRate: 23,
        details: "Design moderno responsivo para telemóveis e computadores, formulário de contacto e SEO base."
      },
      {
        id: "tech_02",
        description: "Assistência Técnica Informática & Diagnóstico",
        unit: "horas",
        price: 30.00,
        vatRate: 23,
        details: "Deteção e reparação de avarias, remoção de malware, otimização de sistemas e backups."
      },
      {
        id: "tech_03",
        description: "Consultoria e Configuração de Ferramentas Digitais",
        unit: "sessão",
        price: 80.00,
        vatRate: 23,
        details: "Parametrização de e-mails profissionais, domínios, nuvem e automação de processos."
      }
    ]
  },
  {
    category: "Serviços Gerais & Manutenção",
    icon: "fa-toolbox",
    items: [
      {
        id: "gen_01",
        description: "Taxa de Deslocação e Diagnóstico Técnico",
        unit: "deslocação",
        price: 35.00,
        vatRate: 23,
        details: "Deslocação ao local da obra/intervenção até um raio de 30 km para avaliação e medições."
      },
      {
        id: "gen_02",
        description: "Manutenção Preventiva e Pequenas Reparações Domésticas",
        unit: "horas",
        price: 22.00,
        vatRate: 23,
        details: "Serviço versátil de pequenas manutenções, ajustes de portas, ferragens e retoques."
      },
      {
        id: "gen_03",
        description: "Limpeza Pós-Obra Especializada",
        unit: "m²",
        price: 4.50,
        vatRate: 23,
        details: "Aspiração profunda, remoção de restos de tintas e cimentos, lavagem de vidros e caixilharias."
      }
    ]
  }
];

const DEFAULT_PROFILE = {
  name: "João Santos",
  nif: "269413448",
  businessType: "Empresário em Nome Individual (ENI)",
  phone: "+351 910 000 000",
  email: "contato@joaosantos.pt",
  address: "Portugal",
  iban: "PT50 0000 0000 0000 0000 0000 0",
  bankName: "Banco em Portugal",
  logoUrl: "",
  defaultVatRate: 23,
  defaultVatExemption: "none", // none, art53, art9, reverseCharge
  defaultIrsRetention: 0, // 0%, 11.5%, 16.5%, 25%
  defaultPaymentTerms: "50% na adjudicação do orçamento e 50% após a conclusão e validação dos trabalhos.",
  defaultValidityDays: 30,
  notes: "Orçamento válido pelo período indicado. Qualquer alteração ou trabalho imprevisto será previamente comunicado e acordado por escrito com o cliente."
};

const VAT_EXEMPTIONS = [
  { value: "none", label: "Sujeito a IVA (Cálculo normal por taxa)" },
  { value: "art53", label: "IVA - Regime especial de isenção [Artigo 53.º do CIVA]" },
  { value: "reverseCharge", label: "IVA - Autoliquidação / Inversão do sujeito passivo [Art. 2.º, n.º 1, al. j)]" },
  { value: "art9", label: "IVA - Isenção [Artigo 9.º do CIVA]" }
];
