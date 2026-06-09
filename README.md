Alterações - João



Busca de restaurantes (Home.jsx)
Adicionei campo de busca na tela inicial que filtra os restaurantes em tempo real pelo nome, sem precisar chamar a API dnv. tela de "nenhum resultado" com botão para limpar a busca tbm.

Botão "Cheguei ao Restaurante" (StatusPedido.jsx)
Adicionado botão que aparece automaticamente quando o pedido está com status PRONTO, permitindo o cliente confirmar a chegada ao restaurante. Ao clicar, o status avança para RETIRADO.


Página de Perfil (Perfil.jsx)
Criada página de perfil do usuário com nome e telefone editáveis. Email exibido como somente leitura.
Backend (auth.js / pedidos.js)
obs: não tá salvando quando sai e entra no perfil :c

Adicionado endpoint PATCH /auth/perfil para atualizar nome e telefone do usuário logado.
Modificado PATCH /pedidos/:id/status para permitir que o cliente confirme a chegada (PRONTO → RETIRADO) no próprio pedido.