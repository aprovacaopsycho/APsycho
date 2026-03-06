# Guia Definitivo: Como Cadastrar e Gerenciar Alunos

Este documento explica como cadastrar novos alunos, conceder acessos a turmas específicas e gerenciar os perfis na plataforma **Aprovação Psycho**.

---

## 1. Acessando a Gestão de Alunos

1. Acesse o **Painel Administrativo** (`admin/index.html`) e faça login.
2. Na barra lateral esquerda, clique no ícone **Gestão de Alunos**.
   Você verá a lista de todos os alunos cadastrados e um formulário para adicionar novos.

---

## 2. Como Cadastrar um Novo Aluno

Para liberar o acesso de um novo aluno à plataforma, siga os passos abaixo:

1. **Vá até a aba "Gestão de Alunos"** no painel admin.
2. Na seção **Novo Aluno**, preencha os dados:
   * **Nome Completo:** Nome do aluno que aparecerá no perfil dele.
   * **Email:** O email que o aluno usará para fazer login (Opcional, porém recomendado para controle).
   * **Telefone:** Telefone do aluno (Opcional).
3. **Selecione os Acessos (Turmas):**
   * Logo abaixo dos dados do aluno, você verá as **Permissões de Acesso** (Checkboxes).
   * Marque as turmas às quais este aluno terá acesso. *(Ex: marque a caixinha "Turma PM-RJ 2026").*
   * *Nota: As turmas dispoíveis aqui são as mesmas que você criou na aba "Gestão de Turmas".*
4. **Clique em "+ Adicionar Aluno".**
5. **(Importante) Salve no Banco de Dados:**
   Após adicionar, não esqueça de clicar no botão azul **1. Salvar DB Local** para gravar a informação permanentemente no arquivo `users_db.json`.

---

## 3. Como o Aluno faz o Login?

Após você cadastrar o aluno, o sistema gera automaticamente uma **Hash** de acesso única baseada no nome dele (Ex: se o aluno for "Nath", a hash gerada pode ser algo como `nath-1234`).

1. No Painel Admin, na lista de alunos, clique no botão em formato de **"Olho"** (Ver Magic Link) ao lado do nome do aluno cadastrado.
2. O sistema abrirá um pop-up com três opções:
   * **Magic Link:** Um link direto (Ex: `membros.html?hash=XYZ`) que fará o login automático.
   * **Hash de Acesso:** O código XYZ que o aluno pode colar manualmente na página de login.
   * **Botão "Copiar Link de Acesso"** para enviar no WhatsApp do aluno.

> **Resumo do Login:** O aluno pode acessar usando o link direto que você enviou, ou ele pode entrar na página `membros.html`, digitar seu respectivo Email ou Hash de Acesso, e clicar em "Acessar Plataforma".

---

## 4. O Que o Aluno Vê ao Fazer Login?

1. Ao efetuar o login com o Link Mágico ou a Hash, a sessão do aluno é iniciada no navegador.
2. A página carregará os cards referentes aos **cursos/turmas que você marcou para ele**.
   * Se ele só tem acesso à "PMRJ_2026", ele verá apenas esse card.
   * Se ele tem acesso à base padrão e a outra turma, verá vários cards.
3. Ao clicar no card, ele será levado direto para a `index_TURMA.html` daquela turma exclusiva.

---

## 5. Como Remover Acessos ou Excluir o Aluno

### Apenas retirar o acesso a uma turma específica

1. No painel de alunos, clique no botão amarelo de **"Editar"** (ícone de lápis) ao lado do aluno.
2. Os dados dele voltarão para o formulário no topo.
3. Desmarque a caixinha da turma da qual você quer retirar o acesso.
4. Clique em **Salvar Alterações**.
5. Clique em **1. Salvar DB Local**.

### Excluir o aluno completamente

1. No painel de alunos, clique no botão vermelho de **"Excluir"** (ícone de lixeira) ao lado do aluno.
2. Confirme a ação.
3. Repita a etapa do **1. Salvar DB Local**. A partir deste momento, o aluno não conseguirá mais logar.
