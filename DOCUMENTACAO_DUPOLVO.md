# Documentação do Projeto — DuPolvo
**App de Lotofácil | Ionic + Angular + Capacitor**
**Data:** Maio de 2026
**Revisão de status:** 26/07/2026 *(comparação com o código atual do repositório)*

> **Legenda:** ✅ Feito · 🟡 Parcial · ❌ Não feito

---

## 1. Visão Geral do Projeto

O **DuPolvo** é um aplicativo mobile voltado para apostas na **Lotofácil da Caixa Econômica Federal**, disponível para **Android e iOS**. A plataforma oferece ao usuário a possibilidade de realizar jogos individuais e participar de bolões, com pagamento integrado via PIX.

O sistema é composto por **três perfis de acesso**:

| Perfil | Descrição |
|---|---|
| **Usuário** | Realiza jogos, participa de bolões e efetua pagamentos |
| **Administrador 2** | Cria e gerencia bolões |
| **Administrador 1 (Global)** | Supervisiona todas as operações, recebe comprovantes e gerencia resultados |

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Front-end / Mobile | Ionic + Angular + Capacitor |
| Back-end | Java + Spring Boot 3 |
| Distribuição | Android (Google Play) e iOS (App Store) |
| Pagamento | PIX (gateway a definir) |

---

## 3. O que já foi entregue

### 3.1 Back-end
API REST completa desenvolvida em Java + Spring Boot 3, responsável por toda a lógica de negócio, autenticação e comunicação com o banco de dados.

**Valor:** R$ 1.400,00 *(já pago)*

### 3.2 Interface do Usuário (Front-end)

A interface do usuário já está implementada com as seguintes telas:

**Autenticação:**
- Login (e-mail + senha)
- Cadastro (nome, e-mail, telefone, senha)
- Recuperação de senha
- Alteração de senha

**Jogo:**
- Escolha manual de 15 números (grid completo da Lotofácil com os 25 números)
- Geração aleatória (1 a 33 cartões)
- Desdobramento (1 a 30 cartões)

**Área do Usuário:**
- Meus cartões — histórico de jogos com status
- Perfil — visualização e edição de dados pessoais

**Navegação:**
- Menu com: Apostar, Cartões, Perfil, Ajuda, Sobre e Sair

---

## 4. Próximos Passos — Escopo de Desenvolvimento

### 4.1 Administrador 1 — Global *(incluso sem custo adicional)* — 🟡 Parcial

Interface exclusiva para o administrador principal da plataforma.

**Funcionalidades:**
- 🟡 Login exclusivo com perfil de Admin Global — *existe um perfil "Super Admin", mas com escopo diferente do descrito (ver seção 9)*
- ❌ Dashboard com todas as operações dos usuários *(sem exibir os números apostados)*
- ❌ Visualização de todos os bolões criados pelo Admin 2
- ❌ Recebimento automático do comprovante de PIX a cada jogo realizado — *hoje a confirmação é manual, feita pelo admin de cada cidade, não automática nem centralizada*
- ❌ Chave PIX configurável diretamente no painel
- ❌ Vinculação dos jogos ao número oficial do concurso da Lotofácil
- ❌ Gestão de premiação — lançamento do resultado e cálculo automático dos ganhadores
- ❌ Relatórios exportáveis (Excel/PDF) com jogos e pagamentos

**Valor: Incluso**

---

### 4.2 Administrador 2 — Bolões — 🟡 Parcial

Interface exclusiva para o administrador de bolões.

**Funcionalidades:**
- ✅ Login exclusivo com perfil de Admin de Bolão
- 🟡 Criação de bolões com definição de:
  - ✅ Valor da cota
  - ✅ Número máximo de participantes
  - ❌ Data limite para entrada — *campo não existe no modelo do bolão*
  - ❌ Regulamento do bolão — *campo não existe*
- 🟡 Gestão de status do bolão: **Aberto → Fechado → Registrado → Resultado** — *só existem os status Aberto e Fechado; "Registrado" e "Resultado" não foram implementados*
- ✅ Visualização dos participantes de cada bolão *(inclui confirmação manual de pagamento por participante)*

**Valor: R$ 700,00**

---

### 4.3 Integração de Pagamento — PIX — ❌ Não feito

Geração de cobrança via PIX no momento em que o usuário finaliza o jogo.

**Funcionalidades:**
- ❌ QR Code PIX gerado automaticamente após confirmação do jogo
- ❌ Comprovante de pagamento enviado ao Admin 1 em tempo real
- ❌ Comprovante disponível também para o usuário
- 🟡 Status do pagamento: **Pendente → Confirmado** — *existe o controle Pendente/Pago/Processado, mas a confirmação é manual pelo admin, sem gateway PIX nem QR Code real*

**Valor: R$ 900,00**

---

### 4.4 Bolão para o Usuário — 🟡 Parcial

Funcionalidade que permite ao usuário visualizar e participar dos bolões criados pelo Admin 2.

**Funcionalidades:**
- 🟡 Listagem de bolões disponíveis com informações de cota, participantes e data limite — *sem data limite, pois o campo não existe*
- 🟡 Entrada no bolão com pagamento via PIX — *o usuário entra no bolão, mas o pagamento ainda é confirmado manualmente, fora de um fluxo PIX real*
- 🟡 Acompanhamento do status do bolão em que o usuário participa — *só há a listagem de bolões abertos; não existe uma tela "meus bolões" com status detalhado*
- ❌ Extrato financeiro — histórico de pagamentos e jogos realizados

**Valor: R$ 600,00**

---

## 5. Funcionalidades Adicionais Sugeridas

### 5.1 Notificações Push — ❌ Não feito

Envio de notificações automáticas para o celular do usuário em momentos-chave:

- Confirmação de pagamento
- Abertura de novo bolão
- Resultado do concurso disponível
- Aviso de premiação

**Valor: R$ 400,00**

---

### 5.2 Integração com Resultado da Lotofácil *(recomendado)* — ❌ Não feito

> **Esta funcionalidade agrega alto valor ao produto e eleva significativamente a experiência do usuário.**

O sistema consulta automaticamente o resultado oficial da Lotofácil após o horário do sorteio (~20h em dias úteis) e processa todas as apostas da plataforma.

**Como funciona tecnicamente:**
A Caixa disponibiliza um endpoint público em seu portal de loterias que retorna o resultado de cada concurso com os números sorteados, data, premiações e número oficial do concurso. O back-end do DuPolvo consulta esse endpoint automaticamente após o sorteio.

**Funcionalidades:**
- Consulta automática do resultado após o sorteio
- Comparação dos números apostados com o resultado oficial
- Cálculo automático de acertos por cartão
- Notificação automática ao usuário informando quantos pontos fez
- Relatório de ganhadores gerado automaticamente para o Admin 1
- Cálculo automático do rateio nos bolões

**Limitações a considerar:**
- O endpoint não é oficialmente documentado pela Caixa — existe possibilidade de alteração futura, o que exigiria manutenção
- Não é streaming em tempo real — o sistema verifica o resultado por polling após o horário do sorteio
- Em caso de alteração do endpoint pela Caixa, uma correção seria necessária

**Valor: R$ 600,00**

---

## 6. Funcionalidades Adicionadas *(não previstas nesta documentação)*

Durante o desenvolvimento, foram construídas funcionalidades que não constavam no escopo original:

### 6.1 Sistema multi-tenant por cidade
A plataforma passou a operar com **um administrador por cidade**: no cadastro, o usuário escolhe entre criar conta de Usuário ou de Administrador, informando a cidade. Só é permitido um Admin por cidade. As apostas exibidas ao Admin no painel são filtradas automaticamente pela cidade dele. Esse conceito de "cidade" não existe na documentação original.

### 6.2 Perfil Super Admin com aprovação de administradores
Foi criado um terceiro nível de acesso, o **Super Admin**, com painel próprio (`superadmin.page.ts`), que:
- Visualiza e aprova/rejeita cadastros de Administrador pendentes por cidade
- Pode resetar o banco de dados (apaga todos os usuários e apostas, exceto contas de Super Admin)

Esse perfil cobre parte do papel do "Administrador 1 Global" descrito na seção 4.1, mas com uma responsabilidade diferente (governança de contas, não operação financeira/premiação).

### 6.3 Controle manual de pagamento (Pendente/Pago/Processado)
Como a integração PIX automática (seção 4.3) ainda não existe, foi implementado um controle manual no painel do Admin: cada aposta pode ser marcada como paga e depois como processada, com registro de data/hora. Isso permite operar a plataforma hoje, mesmo sem o PIX automático.

### 6.4 Carrinho de jogos
Ao montar um cartão (manual, aleatório ou desdobramento), o usuário agora tem a opção de **adicionar o jogo ao carrinho** antes de confirmar — o jogo fica salvo como pendente de pagamento (`paid: 0`) e some da tela de escolha para a lista de "Meus cartões". Essa etapa de carrinho não existia no projeto anterior nem estava prevista nesta documentação. É hoje o ponto de entrada natural para a futura integração de pagamento (seção 4.3): é logo depois de "adicionar ao carrinho" que o QR Code PIX deveria aparecer.

> ⚠️ **Ponto de atenção técnico:** no back-end (`AuthService.java`), o bloqueio de login para administradores com cadastro pendente de aprovação está **desativado propositalmente para testes**, com o comentário `TEMP: bloqueio de aprovacao de admin desativado para testes - REVERTER antes de deixar em producao`. Ou seja, hoje um Admin pendente consegue logar normalmente antes de ser aprovado pelo Super Admin. **Precisa ser revertido antes de qualquer publicação em produção.**

> **Nota:** a rota `/superadmin` também não está registrada no roteador do app (`app-routing.module.ts`) — a tela existe mas não há navegação até ela hoje.

---

## 7. Proposta Comercial

### Opção 1 — Pacote Essencial

Ideal para o lançamento inicial da plataforma com todas as funcionalidades core.

| Item | Valor |
|---|---|
| Admin 1 — Interface Global | Incluso |
| Admin 2 — Interface de Bolões | R$ 700,00 |
| Integração PIX + comprovantes | R$ 900,00 |
| Bolão para o Usuário | R$ 600,00 |
| **Total** | **R$ 2.200,00** |

---

### Opção 2 — Pacote Completo *(recomendado)*

Inclui tudo do Pacote Essencial mais as integrações que elevam a experiência do usuário e automatizam as operações do Admin 1.

| Item | Valor |
|---|---|
| Admin 1 — Interface Global | Incluso |
| Admin 2 — Interface de Bolões | R$ 700,00 |
| Integração PIX + comprovantes | R$ 900,00 |
| Bolão para o Usuário | R$ 600,00 |
| Notificações Push | R$ 400,00 |
| Integração Resultado Lotofácil | R$ 600,00 |
| **Total** | **R$ 3.200,00** |

> **Por que o Pacote Completo vale mais?**
> Com a integração de resultados, o Admin 1 não precisa verificar manualmente quem ganhou — o sistema faz isso automaticamente. Os usuários são notificados no celular assim que o resultado sai, o que gera engajamento e retenção. Essa combinação de automação + notificação é o diferencial competitivo da plataforma.

---

## 8. Resumo Financeiro do Projeto

| Fase | Descrição | Valor |
|---|---|---|
| Fase 1 *(concluída)* | Back-end completo | R$ 1.400,00 |
| Fase 2 *(concluída)* | Interface do Usuário | Incluso na Fase 1 |
| Fase 3 | Pacote Essencial | R$ 2.200,00 |
| Fase 3 | Pacote Completo *(recomendado)* | R$ 3.200,00 |

| | Pacote Essencial | Pacote Completo |
|---|---|---|
| **Investimento total no projeto** | R$ 3.600,00 | R$ 4.600,00 |
| **Valor de mercado estimado** | ~R$ 7.000,00 | ~R$ 10.000,00 |

---

## 9. Observação Legal

A operação de bolões e coleta de pagamentos envolvendo loterias no Brasil é regulada. Recomenda-se consultar um advogado para verificar se o modelo de negócio exige alguma licença específica ou se há restrições legais relacionadas ao repasse de valores entre usuários, especialmente em operações de bolão.

---

*Documentação elaborada em Maio de 2026.*
