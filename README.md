# 📑 Sistema de Orçamentos Profissionais — João Santos (NIF: 269 413 448)

Sistema moderno, responsivo e autónomo de elaboração, cálculo e emissão de propostas de orçamento em Portugal, preparado para publicação e execução direta através do **GitHub Pages**.

---

## 🔍 Informações do Titular e Enquadramento Legal

- **Titular / Prestador:** João Santos
- **NIF (Portugal):** `269 413 448`
  - *Validação algorítmica (Módulo 11):* Válido e conforme com as regras da Autoridade Tributária e Aduaneira (AT).
  - *Estrutura:* NIF de Pessoa Singular / Empresário em Nome Individual (ENI) ou Trabalhador Independente em Portugal.
- **Enquadramentos Fiscais Suportados no Sistema:**
  - **IVA Geral:** Cálculo por taxas normais portuguesas (23%, 13%, 6%).
  - **Artigo 53.º do CIVA:** Regime Especial de Isenção para pequenos prestadores de serviços.
  - **Autoliquidação de IVA:** Regra de inversão do sujeito passivo (*Artigo 2.º, n.º 1, alínea j)* comum no setor de construção civil e empreitadas em Portugal.
  - **Retenção na Fonte de IRS:** Parametrizável (0%, 11.5%, 16.5% ou 25%) para emissão a empresas ou entidades com contabilidade organizada.

---

## 🚀 Como Colocar a Funcionar no GitHub Pages (Passo a Passo)

Este sistema foi construído sem necessidade de servidores ou bases de dados complexas: funciona 100% no browser (HTML5, Tailwind CSS, JavaScript Vanilla e LocalStorage).

### 1. Criar o Repositório no GitHub
1. Aceda ao seu GitHub ([github.com/new](https://github.com/new)).
2. Dê um nome ao repositório (por exemplo: `orcamentos-joao-santos`).
3. Mantenha o repositório como **Public** (para usufruir do GitHub Pages gratuito).
4. Clique em **Create repository**.

### 2. Enviar os Ficheiros para o GitHub
No seu terminal local (dentro desta pasta):
```bash
git init -b main
git add .
git commit -m "feat: Sistema de orçamentos para João Santos (NIF 269413448)"
git remote add origin https://github.com/SEU-UTILIZADOR/orcamentos-joao-santos.git
git push -u origin main
```

### 3. Ativar o GitHub Pages
1. No seu repositório no GitHub, clique na aba **Settings** (Definições).
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment** > **Source**, escolha:
   - **Deploy from a branch**
   - Branch: `main` / Pasta: `/(root)`
   - Clique em **Save**.
   *(Em alternativa, o workflow automático incluído em `.github/workflows/deploy.yml` fará o deploy automático a cada push).*
4. Em cerca de 1 a 2 minutos, o seu sistema estará online no endereço:
   `https://SEU-UTILIZADOR.github.io/orcamentos-joao-santos/`

---

## 🌟 Principais Funcionalidades

1. **Pré-visualização em Tempo Real (Live Preview A4):**
   - O documento oficial de orçamento atualiza-se instantaneamente conforme preenche os dados do cliente e dos serviços.
2. **Catálogo Integrado de Serviços em Portugal:**
   - Construção civil, remodelações e manutenção de edifícios;
   - Eletricidade, canalização e climatização;
   - Tecnologia da informação, desenvolvimento web e suporte técnico;
   - Serviços gerais, taxas de deslocação e limpezas pós-obra;
   - Adição instantânea com um clique e criação livre de novos artigos.
3. **Validação de NIF Português:**
   - Validação matemática em tempo real do NIF/NIPC do cliente com alerta visual de validade.
4. **Exportação Profissional para PDF / Impressão:**
   - Estilos CSS `@media print` otimizados para formato folha A4 com cabeçalho do emitente, termos legais, dados bancários (IBAN) e campo de aceitação/assinatura.
5. **Envio Rápido por WhatsApp:**
   - Botão que gera uma mensagem formatada e cordial com o número do orçamento, resumo dos serviços e valor total para enviar ao cliente num único clique.
6. **Histórico Local e Rascunhos:**
   - Permite guardar propostas no navegador, carregar orçamentos anteriores e reutilizá-los.
7. **Personalização Completa:**
   - Modal para editar em qualquer altura o telefone, e-mail, morada, IBAN e logótipo de João Santos.

---

## 📁 Estrutura do Projeto

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automação de deploy para GitHub Pages
├── css/
│   └── styles.css              # Estilos personalizados e regras de impressão A4
├── js/
│   ├── app.js                  # Lógica de cálculo, NIF, histórico e UI
│   └── catalog.js              # Catálogo predefinido de serviços e dados de perfil
├── .gitignore
├── index.html                  # Interface completa do sistema
└── README.md                   # Documentação de utilização e publicação
```

---

## 📄 Licença e Uso

Desenvolvido para apoio operacional e comercial de **João Santos (NIF 269413448)**.
Livre para utilização, modificação e expansão.
