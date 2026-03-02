// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do Firebase
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

// Funções auxiliares
function gerarProtocolo() {
  return "AB" + Date.now();
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

document.addEventListener("DOMContentLoaded", () => {

  const servicoSelect = document.getElementById("servico");
  const camposDinamicos = document.getElementById("campos-dinamicos");
  const form = document.getElementById("form-contato");

  // Campos dinâmicos
  const campos = {

    "eventos": `
      <div class="form-group">
        <label for="evento">Nome do Evento:</label>
        <input type="text" id="evento" name="evento" required>
      </div>
      <div class="form-group">
        <label for="data">Data:</label>
        <input type="date" id="data" name="data" required>
      </div>
      <div class="form-group">
        <label for="horaInicio">Horário Início:</label>
        <input type="time" id="horaInicio" name="horaInicio" required>
      </div>
      <div class="form-group">
        <label for="horaFim">Horário Fim:</label>
        <input type="time" id="horaFim" name="horaFim" required>
      </div>
      <div class="form-group">
        <label>Endereço do Evento:</label>
        <input type="text" id="cep" name="cep" placeholder="CEP" required>
        <input type="text" id="logradouro" name="logradouro" placeholder="Logradouro" required>
        <input type="text" id="numero" name="numero" placeholder="Número" required>
        <input type="text" id="complemento" name="complemento" placeholder="Complemento (opcional)">
        <input type="text" id="bairro" name="bairro" placeholder="Bairro" required>
        <input type="text" id="cidade" name="cidade" placeholder="Cidade" required>
        <input type="text" id="uf" name="uf" placeholder="UF" required>
      </div>
      <div class="form-group">
        <label for="mensagem">Mensagem:</label>
        <textarea id="mensagem" name="mensagem" placeholder="Informações adicionais (opcional)"></textarea>
      </div>
    `,

    "remocao-hospitalar": `
      <div class="form-group">
        <label>Endereço de Origem:</label>
        <input type="text" id="cepOrigem" name="cepOrigem" placeholder="CEP" required>
        <input type="text" id="logradouroOrigem" name="logradouroOrigem" placeholder="Logradouro" required>
        <input type="text" id="numeroOrigem" name="numeroOrigem" placeholder="Número" required>
        <input type="text" id="complementoOrigem" name="complementoOrigem" placeholder="Complemento (opcional)">
        <input type="text" id="bairroOrigem" name="bairroOrigem" placeholder="Bairro" required>
        <input type="text" id="cidadeOrigem" name="cidadeOrigem" placeholder="Cidade" required>
        <input type="text" id="ufOrigem" name="ufOrigem" placeholder="UF" required>
      </div>
      <div class="form-group">
        <label>Endereço de Destino:</label>
        <input type="text" id="cepDestino" name="cepDestino" placeholder="CEP" required>
        <input type="text" id="logradouroDestino" name="logradouroDestino" placeholder="Logradouro" required>
        <input type="text" id="numeroDestino" name="numeroDestino" placeholder="Número" required>
        <input type="text" id="complementoDestino" name="complementoDestino" placeholder="Complemento (opcional)">
        <input type="text" id="bairroDestino" name="bairroDestino" placeholder="Bairro" required>
        <input type="text" id="cidadeDestino" name="cidadeDestino" placeholder="Cidade" required>
        <input type="text" id="ufDestino" name="ufDestino" placeholder="UF" required>
      </div>
      <div class="form-group">
        <label for="mensagemHospital">Mensagem:</label>
        <textarea id="mensagemHospital" name="mensagemHospital" placeholder="Informações adicionais (opcional)"></textarea>
      </div>
    `,

    "remocao-paciente": `
      <div class="form-group">
        <label for="nomePaciente">Nome do Paciente:</label>
        <input type="text" id="nomePaciente" name="nomePaciente" required>
      </div>
      <div class="form-group">
        <label for="dataNascimento">Data de Nascimento:</label>
        <input type="date" id="dataNascimento" name="dataNascimento" required>
      </div>
      <div class="form-group">
        <label for="altura">Altura:</label>
        <input type="text" id="altura" name="altura" placeholder="Ex: 1.75m" required>
      </div>
      <div class="form-group">
        <label for="peso">Peso:</label>
        <input type="text" id="peso" name="peso" placeholder="Ex: 70kg" required>
      </div>
      <div class="form-group">
        <label for="diagnostico">Diagnóstico:</label>
        <input type="text" id="diagnostico" name="diagnostico" required>
      </div>
      <div class="form-group">
        <label for="condicaoAtual">Condição Atual:</label>
        <input type="text" id="condicaoAtual" name="condicaoAtual" required>
      </div>

      <div class="form-group">
        <label>Endereço de Origem:</label>
        <input type="text" id="cepOrigem" name="cepOrigem" placeholder="CEP" required>
        <input type="text" id="logradouroOrigem" name="logradouroOrigem" placeholder="Logradouro" required>
        <input type="text" id="numeroOrigem" name="numeroOrigem" placeholder="Número" required>
        <input type="text" id="complementoOrigem" name="complementoOrigem" placeholder="Complemento (opcional)">
        <input type="text" id="bairroOrigem" name="bairroOrigem" placeholder="Bairro" required>
        <input type="text" id="cidadeOrigem" name="cidadeOrigem" placeholder="Cidade" required>
        <input type="text" id="ufOrigem" name="ufOrigem" placeholder="UF" required>
      </div>

      <div class="form-group">
        <label>Endereço de Destino:</label>
        <input type="text" id="cepDestino" name="cepDestino" placeholder="CEP" required>
        <input type="text" id="logradouroDestino" name="logradouroDestino" placeholder="Logradouro" required>
        <input type="text" id="numeroDestino" name="numeroDestino" placeholder="Número" required>
        <input type="text" id="complementoDestino" name="complementoDestino" placeholder="Complemento (opcional)">
        <input type="text" id="bairroDestino" name="bairroDestino" placeholder="Bairro" required>
        <input type="text" id="cidadeDestino" name="cidadeDestino" placeholder="Cidade" required>
        <input type="text" id="ufDestino" name="ufDestino" placeholder="UF" required>
      </div>

      <div class="form-group">
        <label for="mensagemPaciente">Mensagem:</label>
        <textarea id="mensagemPaciente" name="mensagemPaciente" placeholder="Informações adicionais (opcional)"></textarea>
      </div>
    `
  };

  function atualizarCampos(servico) {
    camposDinamicos.innerHTML = campos[servico] || "";
  }

  // Evento select
  servicoSelect.addEventListener("change", (e) => {
    atualizarCampos(e.target.value);
  });

  // Evento cards clicáveis
  const cards = document.querySelectorAll(".cards-servicos .card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const titulo = card.querySelector("h3").textContent.toLowerCase().trim();
      let valor = "";
      if (titulo.includes("evento")) valor = "eventos";
      if (titulo.includes("hospitalar")) valor = "remocao-hospitalar";
      if (titulo.includes("pacientes")) valor = "remocao-paciente";

      if(valor) {
        servicoSelect.value = valor;
        atualizarCampos(valor);
        camposDinamicos.scrollIntoView({behavior:"smooth"});
      }
    });
  });

  // Envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(form));
    const protocolo = gerarProtocolo();

    if (!validarEmail(dados.email)) {
      alert("Digite um e-mail válido.");
      return;
    }

    // Montar mensagem WhatsApp
    let mensagem = `🚑 *Novo Orçamento - Abel Remoções*\nProtocolo: ${protocolo}\nTipo: ${dados.servico}\nNome: ${dados.nome}\nTelefone: ${dados.telefone}\nEmail: ${dados.email}\n`;

    Object.keys(dados).forEach(key => {
      if(!["nome","telefone","email","servico"].includes(key) && dados[key]) {
        mensagem += `${key}: ${dados[key]}\n`;
      }
    });

    // Abrir WhatsApp
    const url = `https://wa.me/5511975817190?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

    // Salvar no Firebase
    try {
      const dadosComProtocolo = {
        ...dados,
        protocolo,
        dataEnvio: new Date(),
        status: "novo"
      };
      await addDoc(collection(db, "orcamentos"), dadosComProtocolo);
      alert("Orçamento enviado com sucesso! Protocolo: " + protocolo);
    } catch (err) {
      console.error("Erro ao salvar no Firebase:", err);
      alert("Erro ao salvar o orçamento. Tente novamente.");
    }

    form.reset();
    camposDinamicos.innerHTML = "";
  });

});