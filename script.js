// Inicialização Firebase
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

// Função gerar protocolo
function gerarProtocolo() {
  return "AB" + Date.now();
}

// Função validar e-mail
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ===============================
// CAMPOS DINÂMICOS
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const servicoSelect = document.getElementById("servico");
  const camposDinamicos = document.getElementById("campos-dinamicos");

  const campos = {

    "eventos": `
      <div class="form-group">
        <label for="evento">Nome do Evento:</label>
        <input type="text" id="evento" name="evento" required>
      </div>

      <div class="linha">
        <div class="form-group">
          <label for="data">Data:</label>
          <input type="date" id="data" name="data" required>
        </div>

        <div class="form-group">
          <label for="hora-inicio">Horário Início:</label>
          <input type="time" id="hora-inicio" name="hora-inicio" required>
        </div>

        <div class="form-group">
          <label for="hora-fim">Horário Término:</label>
          <input type="time" id="hora-fim" name="hora-fim" required>
        </div>
      </div>

      <div class="form-group">
        <label for="mensagem-evento">Mensagem:</label>
        <textarea id="mensagem-evento" name="mensagem-evento"></textarea>
      </div>
    `,

    "remocao-hospitalar": `
      <div class="linha">
        <div class="form-group cep">
          <label>CEP:</label>
          <input type="text" class="campo-cep" data-prefixo="origem" maxlength="9" required>
        </div>

        <div class="form-group logradouro">
          <label>Logradouro:</label>
          <input type="text" id="origem-logradouro" required>
        </div>

        <div class="form-group numero">
          <label>Número:</label>
          <input type="text" id="origem-numero" required>
        </div>
      </div>

      <div class="linha">
        <div class="form-group complemento">
          <label>Complemento:</label>
          <input type="text" id="origem-complemento">
        </div>

        <div class="form-group bairro">
          <label>Bairro:</label>
          <input type="text" id="origem-bairro" required>
        </div>

        <div class="form-group cidade">
          <label>Cidade:</label>
          <input type="text" id="origem-cidade" required>
        </div>

        <div class="form-group uf">
          <label>UF:</label>
          <input type="text" id="origem-uf" required>
        </div>
      </div>

      <div class="form-group">
        <label for="mensagem-hospital">Mensagem:</label>
        <textarea id="mensagem-hospital"></textarea>
      </div>
    `,

    "remocao-paciente": `
      <div class="form-group">
        <label for="nome-paciente">Nome do Paciente:</label>
        <input type="text" id="nome-paciente" required>
      </div>

      <div class="form-group">
        <label for="diagnostico">Diagnóstico:</label>
        <input type="text" id="diagnostico" required>
      </div>

      <div class="form-group">
        <label for="mensagem-paciente">Mensagem:</label>
        <textarea id="mensagem-paciente"></textarea>
      </div>
    `
  };

  // ===============================
  // EVENTO DE TROCA DE SERVIÇO
  // ===============================
  servicoSelect.addEventListener("change", () => {

    const servico = servicoSelect.value;

    // Insere os campos
    camposDinamicos.innerHTML = campos[servico] || "";

    // 🔥 Ativa automaticamente os eventos do CEP
    ativarEventosCEP();

  });

  // ===============================
  // FUNÇÃO PARA ATIVAR EVENTO DO CEP
  // ===============================
  function ativarEventosCEP() {

    const ceps = document.querySelectorAll(".campo-cep");

    ceps.forEach(campo => {

      // Máscara automática
      campo.addEventListener("input", function () {
        let valor = this.value.replace(/\D/g, "");

        if (valor.length > 5) {
          valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
        }

        this.value = valor;
      });

      // Busca CEP ao sair do campo
      campo.addEventListener("blur", function () {

        const cep = this.value.replace(/\D/g, "");

        if (cep.length === 8) {
          const prefixo = this.dataset.prefixo;
          buscarCEP(cep, prefixo);
        }

      });

    });

  }

});

  function atualizarCampos(servico) {
    camposDinamicos.innerHTML = campos[servico] || "";
  }

  // Evento select
  servicoSelect.addEventListener("change", (e) => {
    atualizarCampos(e.target.value);
    camposDinamicos.scrollIntoView({ behavior: "smooth" });
  });

  // Evento cards
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
        camposDinamicos.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Evento submit formulário
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

    try {
      await addDoc(collection(db, "orcamentos"), dadosComProtocolo);

      // Monta mensagem WhatsApp organizada
      let mensagem = `🚑 *Novo Orçamento - Abel Remoções*\nProtocolo: ${protocolo}\n\n`;
      mensagem += `Nome: ${dados.nome}\nTelefone: ${dados.telefone}\nEmail: ${dados.email}\nServiço: ${dados.servico}\n\n`;

      if(dados.servico === "eventos") {
        mensagem += `📌 Nome do Evento: ${dados.evento || "-"}\n📅 Data: ${dados.data || "-"}\n⏰ Horário: ${dados.hora || "-"}\n📝 Mensagem: ${dados["mensagem-evento"] || "-"}\n`;
      }
      if(dados.servico === "remocao-hospitalar") {
        mensagem += `📌 Endereço de Origem: ${dados["endereco-origem"] || "-"}\n📍 Endereço de Destino: ${dados["endereco-destino"] || "-"}\n📝 Mensagem: ${dados["mensagem-hospital"] || "-"}\n`;
      }
      if(dados.servico === "remocao-paciente") {
        mensagem += `📌 Nome do Paciente: ${dados["nome-paciente"] || "-"}\n💉 Diagnóstico: ${dados.diagnostico || "-"}\n📝 Mensagem: ${dados["mensagem-paciente"] || "-"}\n`;
      }

      const url = `https://wa.me/5511975817190?text=${encodeURIComponent(mensagem)}`;
      window.open(url, "_blank");

      alert("Orçamento enviado com sucesso! Protocolo: " + protocolo);
      form.reset();
      camposDinamicos.innerHTML = "";
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Houve um erro ao enviar o orçamento. Tente novamente.");
    }
  });
});

async function buscarCEP(cepInput, prefixo) {
  const cep = cepInput.value.replace(/\D/g, '');

  if (cep.length !== 8) return;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (!dados.erro) {
      document.getElementById(prefixo + "_logradouro").value = dados.logradouro || "";
      document.getElementById(prefixo + "_bairro").value = dados.bairro || "";
      document.getElementById(prefixo + "_cidade").value = dados.localidade || "";
      document.getElementById(prefixo + "_uf").value = dados.uf || "";
    }
  } catch (erro) {
    console.log("Erro ao buscar CEP");
  }
}