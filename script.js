// ===============================
// CACHE CEP
// ===============================
const cacheCEP = {};

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
// BUSCAR CEP
// ===============================
async function buscarCEP(campoCEP) {
  const cep = campoCEP.value.replace(/\D/g, "");
  if (cep.length !== 8) return;

  const prefixo = campoCEP.dataset.prefixo;
  const logradouro = document.getElementById(prefixo + "_logradouro");
  const bairro = document.getElementById(prefixo + "_bairro");
  const cidade = document.getElementById(prefixo + "_cidade");
  const uf = document.getElementById(prefixo + "_uf");

  function preencherCampos(dados) {
    if (logradouro) logradouro.value = dados.logradouro || "";
    if (bairro) bairro.value = dados.bairro || "";
    if (cidade) cidade.value = dados.localidade || "";
    if (uf) uf.value = dados.uf || "";
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
      if (cep.length === 8) buscarCEP(this);
    });
  });
}

// ===============================
// HEADER SCROLL
// ===============================
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (!header) return;
  if (window.scrollY > 50) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
});

// ===============================
// MENU HAMBURGER
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menuList = document.getElementById("menu-list");

  if (menuToggle && menuList) {
    menuToggle.addEventListener("click", () =>
      menuList.classList.toggle("active"),
    );

    menuList
      .querySelectorAll("a")
      .forEach((link) =>
        link.addEventListener("click", () =>
          menuList.classList.remove("active"),
        ),
      );
  }
});

// ===============================
// FORMULÁRIO DINÂMICO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const servicoSelect = document.getElementById("servico");
  const camposDinamicos = document.getElementById("campos-dinamicos");
  const form = document.getElementById("form-contato");

  const campos = {
    eventos: `
      <div class="form-group">
        <label for="evento">Evento:</label>
        <input type="text" id="evento" name="evento" required>
      </div>
      <div class="form-group">
        <label for="data">Data:</label>
        <input type="date" id="data" name="data" required>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="hora-inicio">Horário de Início:</label>
          <input type="time" id="hora-inicio" name="hora-inicio" required>
        </div>
        <div class="form-group">
          <label for="hora-termino">Horário do Término:</label>
          <input type="time" id="hora-termino" name="hora-termino" required>
        </div>
      </div>
      <div class="form-group">
        <label for="mensagem-eventos">Mensagem:</label>
        <textarea id="mensagem-eventos" name="mensagem-eventos" required></textarea>
      </div>
    `,
    "remocao-hospitalar": `
      <div class="linha">
        <div class="form-group">
          <label for="origem_cep">CEP Origem:</label>
          <input type="text" id="origem_cep" class="campo-cep" data-prefixo="origem" required>
        </div>
        <div class="form-group">
          <label for="origem_logradouro">Endereço Origem:</label>
          <input type="text" id="origem_logradouro" required>
        </div>
        <div class="form-group">
          <label for="numero-origem">Número:</label>
          <input type="text" id="numero-origem" name="numero-origem">
        </div>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="origem_bairro">Bairro Origem:</label>
          <input type="text" id="origem_bairro" required>
        </div>
        <div class="form-group">
          <label for="origem_cidade">Cidade Origem:</label>
          <input type="text" id="origem_cidade" required>
        </div>
        <div class="form-group">
          <label for="origem_uf">UF Origem:</label>
          <select id="origem_uf" required>
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="ES">ES</option>
          </select>
        </div>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="destino_cep">CEP Destino:</label>
          <input type="text" id="destino_cep" class="campo-cep" data-prefixo="destino" required>
        </div>
        <div class="form-group">
          <label for="destino_logradouro">Endereço Destino:</label>
          <input type="text" id="destino_logradouro" required>
        </div>
        <div class="form-group">
          <label for="numero-destino">Número Destino:</label>
          <input type="text" id="numero-destino" name="numero-destino">
        </div>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="destino_bairro">Bairro Destino:</label>
          <input type="text" id="destino_bairro" required>
        </div>
        <div class="form-group">
          <label for="destino_cidade">Cidade Destino:</label>
          <input type="text" id="destino_cidade" required>
        </div>
        <div class="form-group">
          <label for="destino_uf">UF Destino:</label>
          <select id="destino_uf" required>
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="ES">ES</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="mensagem-hospital">Mensagem:</label>
        <textarea id="mensagem-hospital" name="mensagem-hospital" required></textarea>
      </div>
    `,
    "remocao-paciente": `
      <div class="form-group">
        <label for="nome-paciente">Nome do Paciente:</label>
        <input type="text" id="nome-paciente" name="nome-paciente" required>
      </div>
      <div class="form-group">
        <label for="nascimento-paciente">Data de Nascimento:</label>
        <input type="date" id="nascimento-paciente" name="nascimento-paciente" required>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="peso">Peso (kg):</label>
          <input type="text" id="peso" name="peso" required>
        </div>
        <div class="form-group">
          <label for="altura">Altura (cm):</label>
          <input type="text" id="altura" name="altura" required>
        </div>
        <div class="form-group">
          <label for="diagnostico">Diagnóstico:</label>
          <input type="text" id="diagnostico" name="diagnostico" required>
        </div>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="origem_cep">CEP Origem:</label>
          <input type="text" id="origem_cep" class="campo-cep" data-prefixo="origem" required>
        </div>
        <div class="form-group">
          <label for="origem_logradouro">Endereço Origem:</label>
          <input type="text" id="origem_logradouro" required>
        </div>
        <div class="form-group">
          <label for="numero-origem">Número:</label>
          <input type="text" id="numero-origem" name="numero-origem">
        </div>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="origem_bairro">Bairro Origem:</label>
          <input type="text" id="origem_bairro" required>
        </div>
        <div class="form-group">
          <label for="origem_cidade">Cidade Origem:</label>
          <input type="text" id="origem_cidade" required>
        </div>
        <div class="form-group">
          <label for="origem_uf">UF Origem:</label>
          <select id="origem_uf" required>
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="ES">ES</option>
          </select>
        </div>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="destino_cep">CEP Destino:</label>
          <input type="text" id="destino_cep" class="campo-cep" data-prefixo="destino" required>
        </div>
        <div class="form-group">
          <label for="destino_logradouro">Endereço Destino:</label>
          <input type="text" id="destino_logradouro" required>
        </div>
        <div class="form-group">
          <label for="numero-destino">Número Destino:</label>
          <input type="text" id="numero-destino" name="numero-destino">
        </div>
      </div>
      <div class="linha">
        <div class="form-group">
          <label for="destino_bairro">Bairro Destino:</label>
          <input type="text" id="destino_bairro" required>
        </div>
        <div class="form-group">
          <label for="destino_cidade">Cidade Destino:</label>
          <input type="text" id="destino_cidade" required>
        </div>
        <div class="form-group">
          <label for="destino_uf">UF Destino:</label>
          <select id="destino_uf" required>
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="ES">ES</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="mensagem-paciente">Mensagem:</label>
        <textarea id="mensagem-paciente" name="mensagem-paciente" required></textarea>
      </div>
    `,
  };

  function atualizarCampos(servico) {
    camposDinamicos.innerHTML = campos[servico] || "";
    aplicarMascaraCEP();
  }

  servicoSelect.addEventListener("change", (e) =>
    atualizarCampos(e.target.value),
  );

  // ===============================
  // SUBMIT FORMULÁRIO
  // ===============================
  form.addEventListener("submit", (e) => {
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

    console.log("Orçamento válido!", { protocolo, ...dados });

    let mensagem = `🚑 Novo Orçamento - Protocolo: ${protocolo}\n`;
    mensagem += `Nome: ${dados.nome || ""}\n`;
    mensagem += `Telefone: ${dados.telefone || ""}\n`;
    mensagem += `Email: ${dados.email || ""}\n`;
    mensagem += `Serviço: ${dados.servico || ""}\n`;
    window.open(
      `https://wa.me/5511952716370?text=${encodeURIComponent(mensagem)}`,
      "_blank",
    );

    alert("Formulário válido! Protocolo: " + protocolo);
    form.reset();
    camposDinamicos.innerHTML = "";
  });
});
