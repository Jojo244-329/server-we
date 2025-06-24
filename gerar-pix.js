const express = require('express');
const axios = require('axios');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

app.use(cors());
app.use(express.json());

const PUBLIC_KEY = 'yt0313861_y42n57er76i3n8iu';
const SECRET_KEY = '7w9xbx75ijwk7ewxd4soizd7giiwrn5e416n5mjsub4qa8vgrrb1tntk1pfzzpj6';

const HEADERS = {
  'x-public-key': PUBLIC_KEY,
  'x-secret-key': SECRET_KEY,
  'Content-Type': 'application/json'
};

// 📌 Geração do Pix
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
      client,
      products,
      dueDate,
      metadata: {
        key1: "value1",
        key2: "value2"
      },
      callbackUrl: "https://seusite.com/api/webhook/pix"
    };

    console.log('📡 Enviando PIX para o gateway:\n', JSON.stringify(payloadGateway, null, 2));

    const resposta = await axios.post(
      'https://app.onetimepay.com.br/api/v1/gateway/pix/receive',
      payloadGateway,
      { headers: HEADERS }
    );

    console.log('✅✅✅ PIX GERADO COM SUCESSO ✅✅✅');
    console.log('🟢 Resposta:', JSON.stringify(resposta.data, null, 2));
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
      console.error('🔴 Erro:', JSON.stringify(erro.response.data, null, 2));
      res.status(erro.response.status).json(erro.response.data);
    } else {
      console.error('🔴 Erro genérico:', erro.message);
      res.status(500).json({ erro: erro.message });
    }
    console.log('=======================================================');
  }
});

// 💳 Geração do Cartão
// 💳 Geração do Cartão
app.post('/api/gerar-cartao', async (req, res) => {
  try {
    const {
      client,
      products,
      amount,
      clientIp,
      card,
      installments
    } = req.body;

    const identifier = `id-${Date.now()}`;
    const dataAmanha = new Date();
    dataAmanha.setDate(dataAmanha.getDate() + 1);
    const dueDate = dataAmanha.toISOString().split('T')[0];

    const payloadGateway = {
      identifier,
       amount,
      client: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        document: client.document,
        address: {
          country: client.address.country,
          state: client.address.state,
          city: client.address.city,
          neighborhood: client.address.neighborhood,
          zipCode: client.address.zipCode,
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement
        }
      },
      clientIp: clientIp || "127.0.0.1",
      card: {
        number: card.number,
        owner: card.owner,
        expiresAt: card.expiresAt,
        cvv: card.cvv
      },
      installments,
      products,
      dueDate,
      metadata: {
        key1: "value1",
        key2: "value2"
      },
      callbackUrl: "https://minha.api.com/card/callback/bep150efpd"
    };

    console.log('📡 Enviando CARTÃO para o gateway:\n', JSON.stringify(payloadGateway, null, 2));

    const resposta = await axios.post(
      'https://app.onetimepay.com.br/api/v1/gateway/card/receive',
      payloadGateway,
     { headers: HEADERS }
    );

    console.log('✅✅✅ CARTÃO PROCESSADO COM SUCESSO ✅✅✅');
    console.log('🟢 Resposta:', JSON.stringify(resposta.data, null, 2));
    console.log('=======================================================');

    res.status(200).json(resposta.data);

  } catch (erro) {
    console.error('❌❌❌ ERRO AO PROCESSAR CARTÃO ❌❌❌');
    if (erro.response) {
      console.error('🔴 Status:', erro.response.status);
      console.error('🔴 Erro:', JSON.stringify(erro.response.data, null, 2));
      res.status(erro.response.status).json(erro.response.data);
    } else {
      console.error('🔴 Erro genérico:', erro.message);
      res.status(500).json({ erro: erro.message });
    }
    console.log('=======================================================');
  }
});

router.get('/api/verificar-transacao', async (req, res) => {
  const transactionId = req.query.transactionId;

  try {
    const resposta = await axios.get(`https://app.onetimepay.com.br/api/v1/transactions/${transactionId}`, { headers: HEADERS }
      
    );

    res.status(200).json(resposta.data);
  } catch (erro) {
    console.error("❌ Erro ao consultar transação:", erro.response?.data || erro.message);
    res.status(erro.response?.status || 500).json({ erro: "Erro ao verificar transação." });
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