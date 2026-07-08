# Documentação do Projeto — DuPolvo
**App de Lotofácil | Ionic + Angular + Capacitor**
**Data:** Maio de 2026

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

### 4.1 Administrador 1 — Global *(incluso sem custo adicional)*

Interface exclusiva para o administrador principal da plataforma.

**Funcionalidades:**
- Login exclusivo com perfil de Admin Global
- Dashboard com todas as operações dos usuários *(sem exibir os números apostados)*
- Visualização de todos os bolões criados pelo Admin 2
- Recebimento automático do comprovante de PIX a cada jogo realizado
- Chave PIX configurável diretamente no painel
- Vinculação dos jogos ao número oficial do concurso da Lotofácil
- Gestão de premiação — lançamento do resultado e cálculo automático dos ganhadores
- Relatórios exportáveis (Excel/PDF) com jogos e pagamentos

**Valor: Incluso**

---

### 4.2 Administrador 2 — Bolões

Interface exclusiva para o administrador de bolões.

**Funcionalidades:**
- Login exclusivo com perfil de Admin de Bolão
- Criação de bolões com definição de:
  - Valor da cota
  - Número máximo de participantes
  - Data limite para entrada
  - Regulamento do bolão
- Gestão de status do bolão: **Aberto → Fechado → Registrado → Resultado**
- Visualização dos participantes de cada bolão

**Valor: R$ 700,00**

---

### 4.3 Integração de Pagamento — PIX

Geração de cobrança via PIX no momento em que o usuário finaliza o jogo.

**Funcionalidades:**
- QR Code PIX gerado automaticamente após confirmação do jogo
- Comprovante de pagamento enviado ao Admin 1 em tempo real
- Comprovante disponível também para o usuário
- Status do pagamento: **Pendente → Confirmado**

**Valor: R$ 900,00**

---

### 4.4 Bolão para o Usuário

Funcionalidade que permite ao usuário visualizar e participar dos bolões criados pelo Admin 2.

**Funcionalidades:**
- Listagem de bolões disponíveis com informações de cota, participantes e data limite
- Entrada no bolão com pagamento via PIX
- Acompanhamento do status do bolão em que o usuário participa
- Extrato financeiro — histórico de pagamentos e jogos realizados

**Valor: R$ 600,00**

---

## 5. Funcionalidades Adicionais Sugeridas

### 5.1 Notificações Push

Envio de notificações automáticas para o celular do usuário em momentos-chave:

- Confirmação de pagamento
- Abertura de novo bolão
- Resultado do concurso disponível
- Aviso de premiação

**Valor: R$ 400,00**

---

### 5.2 Integração com Resultado da Lotofácil *(recomendado)*

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

## 6. Proposta Comercial

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

## 7. Resumo Financeiro do Projeto

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

## 8. Observação Legal

A operação de bolões e coleta de pagamentos envolvendo loterias no Brasil é regulada. Recomenda-se consultar um advogado para verificar se o modelo de negócio exige alguma licença específica ou se há restrições legais relacionadas ao repasse de valores entre usuários, especialmente em operações de bolão.

---

*Documentação elaborada em Maio de 2026.*
