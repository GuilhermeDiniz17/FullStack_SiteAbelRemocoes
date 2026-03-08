// ===============================
// FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "abel-remocoes.firebaseapp.com",
  projectId: "abel-remocoes",
  storageBucket: "abel-remocoes.firebasestorage.app",
  messagingSenderId: "678084659954",
  appId: "1:678084659954:web:c63e558b0749e0ab5e9e6b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function gerarProtocolo() {
  return "AB" + Date.now();
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ===============================
// CACHE CEP
// ===============================
const cacheCEP = {};

// ===============================
// BUSCAR CEP
// ===============================
async function buscarCEP(cepInput, prefixo) {
  const cep = cepInput.value.replace(/\D/g, "");
  if (cep.length !== 8) return;

  const logradouro = document.getElementById(prefixo + "_logradouro");
  const bairro = document.getElementById(prefixo + "_bairro");
  const cidade = document.getElementById(prefixo + "_cidade");
  const uf = document.getElementById(prefixo + "_uf");

  function preencherCampos(dados) {
    if (logradouro) {
      logradouro.value = dados.logradouro || "";
      logradouro.readOnly = true;
    }
    if (bairro) {
      bairro.value = dados.bairro || "";
      bairro.readOnly = true;
    }
    if (cidade) {
      cidade.value = dados.localidade || "";
      cidade.readOnly = true;
    }
    if (uf) {
      uf.value = dados.uf || "";
      uf.disabled = true;
    }
  }

  if (cacheCEP[cep]) {
    preencherCampos(cacheCEP[cep]);
    return;
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      alert("CEP não encontrado.");
      return;
    }

    cacheCEP[cep] = dados;
    preencherCampos(dados);
  } catch {
    alert("Erro ao buscar CEP.");
  }
}

// ===============================
// MÁSCARA CEP
// ===============================
function aplicarMascaraCEP() {
  const campos = document.querySelectorAll(".campo-cep");

  campos.forEach((campo) => {
    campo.addEventListener("input", function () {
      let valor = this.value.replace(/\D/g, "");

      if (valor.length > 8) valor = valor.substring(0, 8);
      if (valor.length > 5) valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");

      this.value = valor;
    });

    campo.addEventListener("blur", function () {
      const cep = this.value.replace(/\D/g, "");
      if (cep.length === 8) {
        buscarCEP(this, this.dataset.prefixo);
      }
    });
  });
}

// ===============================
// MENU HAMBURGER
// ===============================
function initMenuHamburger() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu ul");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });
}

// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initMenuHamburger();

  const servicoSelect = document.getElementById("servico");
  const camposDinamicos = document.getElementById("campos-dinamicos");
  const form = document.getElementById("form-contato");

  const campos = {
    eventos: `
      <div class="form-group">
        <label>Nome do Evento:</label>
        <input type="text" name="evento" required>
      </div>

      <div class="linha">
        <div class="form-group">
          <label>Data:</label>
          <input type="date" name="data" required>
        </div>

        <div class="form-group">
          <label>Horário Início:</label>
          <input type="time" name="hora-inicio" required>
        </div>

        <div class="form-group">
          <label>Horário Fim:</label>
          <input type="time" name="hora-fim" required>
        </div>
      </div>

      <div class="form-group">
        <label>Mensagem:</label>
        <textarea name="mensagem-evento"></textarea>
      </div>
    `,

    "remocao-hospitalar": `
      <div class="linha">
        <div class="form-group">
          <label>CEP:</label>
          <input type="text" 
                 id="origem_cep" 
                 class="campo-cep" 
                 data-prefixo="origem"
                 maxlength="9"
                 placeholder="00000-000"
                 required>
        </div>

        <div class="form-group">
          <label>Logradouro:</label>
          <input type="text" id="origem_logradouro" required>
        </div>

        <div class="form-group">
          <label>Número:</label>
          <input type="text" name="origem-numero">
        </div>
      </div>

      <div class="linha">
        <div class="form-group">
          <label>Bairro:</label>
          <input type="text" id="origem_bairro" required>
        </div>

        <div class="form-group">
          <label>Cidade:</label>
          <input type="text" id="origem_cidade" required>
        </div>

        <div class="form-group">
          <label>UF:</label>
          <select id="origem_uf" required>
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="ES">ES</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Mensagem:</label>
        <textarea name="mensagem-hospital"></textarea>
      </div>
    `,

    "remocao-paciente": `
      <div class="form-group">
        <label>Nome do Paciente:</label>
        <input type="text" name="nome-paciente" required>
      </div>

      <div class="form-group">
        <label>Diagnóstico:</label>
        <input type="text" name="diagnostico" required>
      </div>

      <div class="form-group">
        <label>Mensagem:</label>
        <textarea name="mensagem-paciente"></textarea>
      </div>
    `,
  };

  function atualizarCampos(servico) {
    camposDinamicos.innerHTML = campos[servico] || "";
    aplicarMascaraCEP();
  }

  servicoSelect.addEventListener("change", (e) => {
    atualizarCampos(e.target.value);
  });

  // ===============================
  // SUBMIT
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = Object.fromEntries(new FormData(form));
    const protocolo = gerarProtocolo();

    if (!validarEmail(dados.email)) {
      alert("Digite um e-mail válido.");
      return;
    }

    const camposCEP = document.querySelectorAll(".campo-cep");
    for (let campo of camposCEP) {
      const valor = campo.value.replace(/\D/g, "");
      if (valor.length !== 8) {
        alert("Preencha o CEP corretamente.");
        campo.focus();
        return;
      }
    }

    const dadosComProtocolo = {
      ...dados,
      protocolo,
      dataEnvio: new Date(),
      status: "novo",
    };

    try {
      await addDoc(collection(db, "orcamentos"), dadosComProtocolo);

      let mensagem = `🚑 *Novo Orçamento - Abel Remoções*\n`;
      mensagem += `Protocolo: ${protocolo}\n\n`;
      mensagem += `Nome: ${dados.nome}\n`;
      mensagem += `Telefone: ${dados.telefone}\n`;
      mensagem += `Email: ${dados.email}\n`;
      mensagem += `Serviço: ${dados.servico}\n`;

      const url = `https://wa.me/5511952716370?text=${encodeURIComponent(mensagem)}`;
      window.open(url, "_blank");

      alert("Orçamento enviado com sucesso! Protocolo: " + protocolo);

      form.reset();
      camposDinamicos.innerHTML = "";
    } catch (error) {
      alert("Erro ao enviar orçamento.");
    }
  });
});
