# Sistema de Agendamento de Consultas

## Estrutura do Sistema

### 1. Página Inicial (Home)
- Formulário de agendamento com os campos:
  - Nome Completo
  - Data de Nascimento
  - Telefone
  - Cidade (dropdown com 5 opções)
  - Data da Consulta
  - Horário da Consulta
- Logo no topo
- Ícone de acesso à área administrativa

### 2. Área Administrativa
Sistema com quatro seções principais acessíveis via menu de navegação:

#### 2.1 Dashboard
- Gráficos informativos:
  - Total de agendamentos por cidade
  - Distribuição de agendamentos por status
  - Agendamentos por mês
  - Taxa de comparecimento
- Cards com resumos:
  - Total de agendamentos
  - Agendamentos do dia
  - Próximos agendamentos
  - Taxa de ocupação

#### 2.2 Datas Disponíveis
- Formulário para cadastro de datas:
  - Seleção da cidade (dropdown)
  - Campo para inserção de data
- Tabela com datas cadastradas:
  - Cidade
  - Data
  - Status (Disponível/Indisponível)
  - Ações (Editar/Excluir)
- Filtros por cidade e período

#### 2.3 Clientes
- Tabela organizada por cidade com:
  - Nome do cliente
  - Idade (calculada a partir da data de nascimento)
  - Data agendada
  - Horário
  - Status do agendamento
- Funcionalidades:
  - Filtros por cidade e período
  - Geração de PDF com os dados filtrados
  - Exportação de relatórios

#### 2.4 Gerenciamento de Usuários
- Interface para gerenciamento de usuários administrativos
- Funcionalidades:
  - Criar novo usuário (email e senha)
  - Listar usuários existentes
  - Excluir usuários
- Acesso restrito apenas a usuários autenticados
- Tabela com informações:
  - Email do usuário
  - Data de criação
  - Status (ativo/inativo)
  - Ação de exclusão

## Tecnologias Utilizadas
- React.js
- Material-UI
- Firebase (Autenticação e Banco de Dados)
- React Router DOM
- Chart.js para gráficos
- React-PDF para geração de documentos

## Implementação

### Fase 1 - 
- Configuração inicial do projeto
- Implementação do formulário de agendamento
- Configuração do Firebase
- Implementação da autenticação

### Fase 2 - 
- Implementação do Dashboard com gráficos
- Criação do menu de navegação
- Desenvolvimento dos componentes de gráficos

### Fase 3 - 
- Sistema de gestão de datas disponíveis
- Cadastro de datas por cidade
- Visualização e gestão de datas cadastradas

### Fase 4 - 
- Sistema de visualização de clientes
- Implementação dos filtros por cidade
- Sistema de geração de PDF
- Exportação de relatórios

### Fase 5 - 
- Implementação do gerenciamento de usuários
- Criação da interface de cadastro
- Sistema de listagem de usuários
- Funcionalidade de exclusão
- Integração com Firebase Authentication

## Como Executar o Projeto
1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente do Firebase
4. Execute o projeto: `npm start`

## Contribuição
Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das alterações
4. Faça push para a branch
5. Abra um Pull Request