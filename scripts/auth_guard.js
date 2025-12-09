/**
 * AUTH GUARD
 * Verifica se o usuário tem o hash de membro na sessão.
 * Se não tiver, redireciona para a página de login (membros.html).
 * 
 * Deve ser incluído no <head> das páginas restritas dentro de subpastas (ex: PMPR/).
 */

(function () {
    try {
        // Verifica se estamos em ambiente local/preview que possa justificar ignorar (opcional)
        // Mas para segurança, mantemos a verificação ativa sempre.

        const memberHash = sessionStorage.getItem('memberHash');

        if (!memberHash) {
            console.warn("Acesso negado. Redirecionando para login...");
            // Assume que o arquivo está em uma subpasta (ex: PMPR/) e volta um nível.
            // Se a estrutura de pastas mudar, isso precisará ser ajustado.
            window.location.href = '../membros.html';
        }
    } catch (e) {
        console.error("Erro na verificação de segurança:", e);
        // Em caso de erro crítico no script, por segurança, também redireciona
        window.location.href = '../membros.html';
    }
})();
