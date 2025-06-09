const express = require('express');
const axios = require('axios');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/gerar-pix', async (req, res) => {
  try {
    const { client, products, amountFinal } = req.body;

    const identifier = `id-${Date.now()}`;
    const dataAmanha = new Date();
    dataAmanha.setDate(dataAmanha.getDate() + 1);
    const dueDate = dataAmanha.toISOString().split('T')[0];

    const payloadGateway = {
      identifier,
      amount: amountFinal,
      client: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        document: client.document
      },
      products: products.map((p, index) => ({
        id: p.id || Math.random().toString(36).substring(2, 12),
        name: p.name,
        quantity: p.quantity,
        price: p.price
      })),
      dueDate,
      metadata: {
        key1: "value1",
        key2: "value2"
      },
      callbackUrl: "https://minha.api.com/pix/callback"
    };

    console.log('📡 Enviando para gateway:', JSON.stringify(payloadGateway, null, 2));

    const resposta = await axios.post('https://app.onetimepay.com.br/api/v1/gateway/pix/receive',
      payloadGateway,
      {
        headers: {
          'x-public-key': 'yt0313861_y42n57er76i3n8iu',
          'x-secret-key': '7w9xbx75ijwk7ewxd4soizd7giiwrn5e416n5mjsub4qa8vgrrb1tntk1pfzzpj6',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅✅✅ TRANSAÇÃO BEM-SUCEDIDA ✅✅✅');
    console.log('🟢 Resposta do gateway:', JSON.stringify(resposta.data, null, 2));
    console.log('=======================================================');

    res.status(200).json({
      pixCode: resposta.data.pix.code,
      pixQrCodeBase64: resposta.data.pix.base64,
      orderId: resposta.data.order.id,
      orderUrl: resposta.data.order.url,
      transactionId: resposta.data.transactionId
    });

  } catch (erro) {
    console.error('❌❌❌ ERRO AO GERAR PIX ❌❌❌');

    if (erro.response) {
      console.error('🔴 Status:', erro.response.status);
      console.error('🔴 Dados do erro:', JSON.stringify(erro.response.data, null, 2));
      res.status(erro.response.status).json(erro.response.data);
    } else {
      console.error('🔴 Erro genérico:', erro.message);
      res.status(500).json({ erro: erro.message });
    }

    console.log('=======================================================');
  }
});

// ⚠️ Remova o app.listen para funcionar na Vercel
// app.listen(3000, () => {
//   console.log("✅ Servidor rodando em http://localhost:3000");
// });

// 👇 Exportação correta para Vercel
module.exports = app;
module.exports.handler = serverless(app);
// 