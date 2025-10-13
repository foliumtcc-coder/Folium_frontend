// Adicione este código ao seu arquivo project.js ou crie um novo arquivo drag-drop.js

function initializeDragAndDrop() {
  const stepsContainer = document.querySelector('.etapas-container, .project-steps');
  
  if (!stepsContainer) return;

  // Adiciona o botão de arrastar em cada etapa
  function addDragHandles() {
    const steps = stepsContainer.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
      // Verifica se já tem o handle
      if (step.querySelector('.drag-handle')) return;
      
      const stepHeader = step.querySelector('.step-header');
      if (!stepHeader) return;

      // Cria o wrapper para o conteúdo do header
      const headerContent = document.createElement('div');
      headerContent.className = 'step-header-content';
      
      // Move todo o conteúdo atual para dentro do wrapper
      while (stepHeader.firstChild) {
        headerContent.appendChild(stepHeader.firstChild);
      }

      // Cria o botão de arrastar
      const dragHandle = document.createElement('div');
      dragHandle.className = 'drag-handle';
      dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
      dragHandle.setAttribute('draggable', 'true');
      dragHandle.title = 'Arrastar para reordenar';

      // Adiciona o handle e o conteúdo de volta ao header
      stepHeader.appendChild(dragHandle);
      stepHeader.appendChild(headerContent);

      // Torna a etapa arrastável
      step.setAttribute('draggable', 'true');
      step.dataset.stepIndex = index;
    });
  }

  // Variável para guardar o elemento sendo arrastado
  let draggedElement = null;

  // Evento quando começa a arrastar
  stepsContainer.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('step')) {
      draggedElement = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.target.innerHTML);
    }
  });

  // Evento quando termina de arrastar
  stepsContainer.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('step')) {
      e.target.classList.remove('dragging');
      
      // Remove a classe drag-over de todos os elementos
      document.querySelectorAll('.step.drag-over').forEach(step => {
        step.classList.remove('drag-over');
      });
      
      draggedElement = null;
    }
  });

  // Evento quando passa por cima de outro elemento
  stepsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    
    const targetStep = e.target.closest('.step');
    
    if (targetStep && targetStep !== draggedElement) {
      // Remove drag-over de todos
      document.querySelectorAll('.step.drag-over').forEach(step => {
        step.classList.remove('drag-over');
      });
      
      // Adiciona no elemento atual
      targetStep.classList.add('drag-over');
    }
  });

  // Evento quando entra em um elemento
  stepsContainer.addEventListener('dragenter', (e) => {
    e.preventDefault();
  });

  // Evento quando sai de um elemento
  stepsContainer.addEventListener('dragleave', (e) => {
    const targetStep = e.target.closest('.step');
    if (targetStep) {
      targetStep.classList.remove('drag-over');
    }
  });

  // Evento quando solta o elemento
  stepsContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const targetStep = e.target.closest('.step');
    
    if (targetStep && draggedElement && targetStep !== draggedElement) {
      // Remove a classe drag-over
      targetStep.classList.remove('drag-over');
      
      // Determina se deve inserir antes ou depois
      const rect = targetStep.getBoundingClientRect();
      const mouseY = e.clientY;
      const middle = rect.top + rect.height / 2;
      
      if (mouseY < middle) {
        // Insere antes
        stepsContainer.insertBefore(draggedElement, targetStep);
      } else {
        // Insere depois
        stepsContainer.insertBefore(draggedElement, targetStep.nextSibling);
      }
      
      // Atualiza os índices
      updateStepIndices();
      
      // Aqui você pode adicionar código para salvar a nova ordem no backend
      saveStepOrder();
    }
  });

  // Atualiza os índices das etapas após reordenar
  function updateStepIndices() {
    const steps = stepsContainer.querySelectorAll('.step');
    steps.forEach((step, index) => {
      step.dataset.stepIndex = index;
    });
  }

  // Função para salvar a ordem (você deve implementar a lógica de backend)
async function saveStepOrder() {
  const stepsContainer = document.querySelector('.etapas-container');
  const steps = stepsContainer.querySelectorAll('.step');
  
  const order = Array.from(steps).map((step, index) => ({
    etapaId: step.dataset.etapaId,
    numero_etapa: index + 1
  }));
  
  console.log('Nova ordem das etapas:', order);
  
  try {
    // Importa a função updateEtapa do api.js
    const { updateEtapa } = await import('./api.js');
    
    // Atualiza cada etapa com o novo número
    for (const item of order) {
      await updateEtapa(item.etapaId, null, null, item.numero_etapa);
    }
    
    console.log('Ordem das etapas atualizada com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar ordem das etapas:', err);
    alert('Erro ao salvar nova ordem das etapas.');
  }
}

  // Inicializa os handles
  addDragHandles();
  
  // Se você adicionar etapas dinamicamente, chame addDragHandles() novamente
  // Exemplo: depois de carregar as etapas via AJAX
}

// Chama a função quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDragAndDrop);
} else {
  initializeDragAndDrop();
}

// Exporta a função se estiver usando modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeDragAndDrop };
}