// prisma/seed.js
// Popula o banco com dados iniciais (mesmos do mock do frontend)

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Populando banco de dados...")

  // Limpa tudo na ordem certa (evita erro de foreign key)
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.item.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.restaurante.deleteMany()

  // Categorias
  const categorias = await prisma.categoria.createMany({
    data: [
      { id: 1, nome: "Lanches" },
      { id: 2, nome: "Pizzas" },
      { id: 3, nome: "Bebidas" },
      { id: 4, nome: "Sobremesas" },
      { id: 5, nome: "Japonês" },
    ],
  })

  // Restaurantes
  const bk = await prisma.restaurante.create({
    data: { nome: "Burger King", descricao: "Os melhores hambúrgueres", aberto: true },
  })
  const mc = await prisma.restaurante.create({
    data: { nome: "McDonald's", descricao: "I'm lovin' it", aberto: true },
  })
  const pizza = await prisma.restaurante.create({
    data: { nome: "Pizza Hut", descricao: "Pizza de verdade", aberto: false },
  })
  const subway = await prisma.restaurante.create({
    data: { nome: "Subway", descricao: "Sanduíches frescos", aberto: true },
  })

  // Itens do cardápio
  await prisma.item.createMany({
    data: [
      // BK
      { nome: "Whopper", preco: 25.90, descricao: "Hambúrguer clássico grelhado", restauranteId: bk.id, categoriaId: 1 },
      { nome: "Onion Rings", preco: 12.90, descricao: "Anéis de cebola crocantes", restauranteId: bk.id, categoriaId: 1 },
      { nome: "Chicken Crispy", preco: 22.90, descricao: "Frango empanado crocante", restauranteId: bk.id, categoriaId: 1 },
      { nome: "Coca-Cola 500ml", preco: 8.90, descricao: "Refrigerante gelado", restauranteId: bk.id, categoriaId: 3 },

      // McDonald's
      { nome: "Big Mac", preco: 23.90, descricao: "Dois hambúrgueres com molho especial", restauranteId: mc.id, categoriaId: 1 },
      { nome: "McFritas M", preco: 10.90, descricao: "Batata frita crocante tamanho médio", restauranteId: mc.id, categoriaId: 1 },
      { nome: "McFlurry Oreo", preco: 14.90, descricao: "Sorvete com pedaços de Oreo", restauranteId: mc.id, categoriaId: 4 },
      { nome: "McChicken", preco: 19.90, descricao: "Sanduíche de frango com alface", restauranteId: mc.id, categoriaId: 1 },

      // Pizza Hut
      { nome: "Pizza Pepperoni", preco: 49.90, descricao: "Pizza individual com pepperoni", restauranteId: pizza.id, categoriaId: 2 },
      { nome: "Pizza Margherita", preco: 44.90, descricao: "Molho, mussarela e manjericão", restauranteId: pizza.id, categoriaId: 2 },

      // Subway
      { nome: "Frango Teriyaki 30cm", preco: 28.90, descricao: "Sanduíche frango com molho teriyaki", restauranteId: subway.id, categoriaId: 1 },
      { nome: "Atum 15cm", preco: 18.90, descricao: "Sanduíche de atum com vegetais", restauranteId: subway.id, categoriaId: 1 },
    ],
  })

  // Senhas com hash
  const senhaHash = await bcrypt.hash("123456", 10)

  // Usuários
  const cliente = await prisma.usuario.create({
    data: {
      nome: "Felipe",
      email: "felipe@email.com",
      senha: senhaHash,
      cpf: "000.000.000-00",
      telefone: "(81) 99999-0001",
      role: "CLIENTE",
    },
  })

  await prisma.usuario.create({
    data: {
      nome: "Admin",
      email: "admin@email.com",
      senha: senhaHash,
      role: "ADMIN",
    },
  })

  await prisma.usuario.create({
    data: {
      nome: "BK Manager",
      email: "bk@email.com",
      senha: senhaHash,
      role: "RESTAURANTE",
      restauranteId: bk.id,
    },
  })

  await prisma.usuario.create({
    data: {
      nome: "MC Manager",
      email: "mc@email.com",
      senha: senhaHash,
      role: "RESTAURANTE",
      restauranteId: mc.id,
    },
  })

  // Pedido de exemplo para o Felipe
  const itensDB = await prisma.item.findMany({ where: { restauranteId: bk.id } })
  const whopper = itensDB.find(i => i.nome === "Whopper")

  if (whopper) {
    await prisma.pedido.create({
      data: {
        clienteId: cliente.id,
        restauranteId: bk.id,
        total: 25.90,
        status: "PRONTO",
        itens: {
          create: [{ itemId: whopper.id, quantidade: 1, precoUnit: whopper.preco }],
        },
      },
    })
  }

  console.log("✅ Banco populado com sucesso!")
  console.log("")
  console.log("📧 Contas criadas:")
  console.log("  Cliente:     felipe@email.com  / 123456")
  console.log("  Admin:       admin@email.com   / 123456")
  console.log("  Restaurante: bk@email.com      / 123456")
  console.log("  Restaurante: mc@email.com      / 123456")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
