import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQeHWz1ZGNkm67ZPNjo5Hh6VIH05GN9Z4",
  authDomain: "abel-remocoes.firebaseapp.com",
  projectId: "abel-remocoes",
  storageBucket: "abel-remocoes.firebasestorage.app",
  messagingSenderId: "678084659954",
  appId: "1:678084659954:web:c63e558b0749e0ab5e9e6b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function gerarProtocolo() {
  return "AB" + Date.now();
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

const form = document.getElementById("formOrcamento");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = Object.fromEntries(new FormData(form));
  const protocolo = gerarProtocolo();

  if (!validarEmail(dados.email)) {
    alert("Digite um e-mail válido.");
    return;
  }

  const dadosComProtocolo = {
    ...dados,
    protocolo,
    dataEnvio: new Date(),
    status: "novo"
  };

  await addDoc(collection(db, "orcamentos"), dadosComProtocolo);

  const mensagem = `
🚑 *Novo Orçamento - Abel Remoções*
Protocolo: ${protocolo}

Tipo: ${dados.tipoServico}
Contratante: ${dados.contratante}
Telefone: ${dados.telefone}
Email: ${dados.email}

Origem: ${dados.origem}
Destino: ${dados.destino}
Horário: ${dados.horario}

Expectativa: ${dados.expectativa}
  `;

  const url = `https://wa.me/5511952716370?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");

  alert("Orçamento enviado com sucesso! Protocolo: " + protocolo);
  form.reset();
});