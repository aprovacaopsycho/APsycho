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
            console.warn("Acesso negado (Sem sessão).");
            window.location.href = '../membros.html';
            return;
        }

        // Re-validate against server data (Automatic Expiration)
        fetch('../hashes_membros.json', { cache: "no-store" })
            .then(res => res.json())
            .then(hashes => {
                // Check if hash exists
                if (!hashes.hasOwnProperty(memberHash)) {
                    alert("Sessão inválida. Faça login novamente.");
                    window.location.href = '../membros.html';
                    return;
                }

                // Check Expiration
                const expiry = hashes[memberHash];
                if (expiry) {
                    const expDate = new Date(expiry);
                    if (expDate < new Date()) {
                        alert(`Seu tempo de acesso expirou em ${expDate.toLocaleDateString()}.`);
                        sessionStorage.removeItem('memberHash');
                        window.location.href = '../membros.html';
                    }
                }
            })
            .catch(err => {
                console.error("Erro ao validar licença:", err);
                // Optional: fail open or closed? Closed for security.
            });
    } catch (e) {
        console.error("Erro na verificação de segurança:", e);
        // Em caso de erro crítico no script, por segurança, também redireciona
        window.location.href = '../membros.html';
    }
})();
