# Guia Definitivo: Como Criar e Gerenciar Novas Turmas

Este documento explica o novo fluxo simplificado para a criação de turmas na plataforma **Aprovação Psycho**.
Com a nova atualização, o sistema **não copia mais pastas inteiras**. Ele cria apenas arquivos específicos (`index` e `aulas`) dentro da pasta unificada `Base/`, reduzindo o espaço em disco e facilitando a manutenção.

---

## 1. Como Criar uma Turma Passo a Passo

1. **Abra o Painel Admin:**
   Acesse a página de administração (`admin/index.html`) e faça login com suas credenciais de administrador.

2. **Acesse a aba "Gestão de Turmas":**
   Na barra lateral esquerda, clique no ícone **Gestão de Turmas**.

3. **Preencha os Dados da Nova Turma:**
   Na seção "Nova Turma", preencha os seguintes campos:
   * **Nome da Turma (Exibição):** O nome que vai aparecer nos cards para os alunos. *(Ex: Turma PM-RJ 2026)*
   * **Nome da Pasta (Sem espaços):** O identificador único da turma. **Atenção:** não use espaços nem caracteres especiais. *(Ex: PMRJ_2026)*
   * **Imagem de Fundo (URL):** Opcional, link da imagem que aparece no card.
   * **Modelo Base:** Deixe `Base (Modelo Padrão)`.

4. **Salve a Turma:**
   Clique no botão azul **Salvar Turma**.

   > **IMPORTANTE:**
   > Se o servidor local de automação (`python admin/sync_turmas.py`) estiver rodando em segundo plano, os arquivos da turma serão criados **automaticamente**.

---

## 2. Como Gerar as Páginas da Turma (Sincronização)

Se o servidor local não estava rodando quando você salvou a turma, você precisa gerar as páginas manualmente:

1. No painel de turmas, clique no botão azul **1. Salvar DB Local** para atualizar o arquivo `turmas_db.json`.
2. Abra o seu terminal (Prompt de Comando ou VS Code) na pasta do projeto `APsycho`.
3. Rode o script de sincronização com o comando:

   ```bash
   python admin/sync_turmas.py
   ```

4. Pressione `1` para **Sincronizar Agora**.
5. O script irá ler as turmas do seu painel e criar automaticamente os arquivos da sua nova turma.

---

## 3. O Que o Sistema Faz nos Bastidores?

Quando uma turma é criada, por exemplo com o Nome da Pasta `"PM_SP"`, o sistema faz o seguinte:

1. Vai na pasta `Base/`.
2. Faz uma cópia do modelo `Base/index.html` e a renomeia para **`Base/index_PM_SP.html`**.
3. Faz uma cópia do modelo `Base/aulas.html` e a renomeia para **`Base/aulas_PM_SP.html`**.
4. Modifica os links internos desses arquivos para que o `index_PM_SP.html` aponte corretamente para `aulas_PM_SP.html` e vice-versa.

---

## 4. Como Customizar a Análise do Edital (Exclusivo por Turma)

A grande vantagem desse sistema é que a página de **Análise do Edital (index)** agora é individual. Para colocar o vídeo específico do edital da turma criada:

1. Vá na pasta `Base/`.
2. Abra o arquivo gerado para sua turma, por exemplo `index_PMRJ_2026.html`.
3. Procure a linha onde está o iframe do YouTube (Vídeo):

   ```html
   <iframe src="https://www.youtube.com/embed/S_wLklkQGvM" ...></iframe>
   ```

4. Substitua o link pelo vídeo da análise do edital daquela turma específica.

## 5. Como Vincular Alunos à Nova Turma

1. No Painel Admin, vá para a aba **Gestão de Alunos**.
2. Ao adicionar ou editar um aluno, a nova turma que você criou aparecerá automaticamente como uma caixa de seleção (Checkbox) em **Permissões de Acesso**.
3. Basta marcar a caixinha com o nome da turma para liberar o acesso daquele aluno.
4. Quando o aluno fizer login na página `membros.html`, ele verá o card da turma e, ao clicar, será automaticamente redirecionado à página correta (`Base/index_SUA_TURMA.html`).
