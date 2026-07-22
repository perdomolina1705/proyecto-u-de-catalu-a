/**
 * CONTROL ANXIETY EXPRESS - Core Application Controller
 * Desarrollado bajo arquitectura orientada a estado e inmutabilidad.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // ESTADO DE LA APLICACIÓN (State Management)
    // ==========================================
    const state = {
        maxTolerance: 10,
        items: [] // Array de objetos: { id, title, type, impact, resolved }
    };

    // ==========================================
    // REFERENCIAS AL DOM
    // ==========================================
    const maxToleranceInput = document.getElementById('maxTolerance');
    const btnSetTolerance = document.getElementById('btnSetTolerance');
    const trackerForm = document.getElementById('trackerForm');
    const itemTitleInput = document.getElementById('itemTitle');
    const itemTypeSelect = document.getElementById('itemType');
    const itemImpactInput = document.getElementById('itemImpact');
    
    const currentAnxietyVal = document.getElementById('currentAnxietyVal');
    const maxToleranceVal = document.getElementById('maxToleranceVal');
    const percentageVal = document.getElementById('percentageVal');
    const progressBar = document.getElementById('progressBar');
    const statusBadge = document.getElementById('statusBadge');
    
    const dynamicAlert = document.getElementById('dynamicAlert');
    const itemsList = document.getElementById('itemsList');
    const emptyState = document.getElementById('emptyState');
    const btnClearAll = document.getElementById('btnClearAll');

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    // Función 1: Definir Tolerancia / Batería Emocional
    btnSetTolerance.addEventListener('click', () => {
        const val = parseInt(maxToleranceInput.value, 10);
        if (!isNaN(val) && val > 0) {
            state.maxTolerance = val;
            updateUI();
        } else {
            alert('Por favor introduce un número válido mayor a 0.');
        }
    });

    // Función 2: Agregar nuevo Disparador o Estrategia
    trackerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = itemTitleInput.value.trim();
        const type = itemTypeSelect.value;
        const impact = parseInt(itemImpactInput.value, 10);

        if (!title || isNaN(impact) || impact < 1) return;

        const newItem = {
            id: Date.now(),
            title: title,
            type: type,
            impact: impact,
            resolved: false
        };

        state.items.push(newItem);
        
        // Limpiar inputs del formulario
        itemTitleInput.value = '';
        itemImpactInput.value = '3';
        itemTitleInput.focus();

        updateUI();
    });

    // Función 5 (Acciones): Toggle "Superado" y Eliminar elementos
    itemsList.addEventListener('click', (e) => {
        const target = e.target;
        const btn = target.closest('button');
        if (!btn) return;

        const id = parseInt(btn.dataset.id, 10);

        if (btn.classList.contains('btn-resolve')) {
            toggleItemResolved(id);
        } else if (btn.classList.contains('btn-delete')) {
            deleteItem(id);
        }
    });

    // Función 5 (Limpieza completa): Limpiar todo
    btnClearAll.addEventListener('click', () => {
        if (state.items.length === 0) return;
        if (confirm('¿Deseas reiniciar y borrar todos los registros de hoy?')) {
            state.items = [];
            updateUI();
        }
    });

    // ==========================================
    // FUNCIONES DE LÓGICA & CÁLCULO
    // ==========================================

    function toggleItemResolved(id) {
        state.items = state.items.map(item => {
            if (item.id === id) {
                return { ...item, resolved: !item.resolved };
            }
            return item;
        });
        updateUI();
    }

    function deleteItem(id) {
        state.items = state.items.filter(item => item.id !== id);
        updateUI();
    }

    /**
     * Calcula la ansiedad acumulada actual.
     * Disparadores no resueltos suman impacto.
     * Estrategias no resueltas restan impacto.
     */
    function calculateAnxiety() {
        let total = 0;
        state.items.forEach(item => {
            if (!item.resolved) {
                if (item.type === 'trigger') {
                    total += item.impact;
                } else if (item.type === 'strategy') {
                    total -= item.impact;
                }
            }
        });
        return Math.max(0, total); // No permitir valores negativos
    }

    // ==========================================
    // ACTUALIZACIÓN DINÁMICA DE LA INTERFAZ (DOM)
    // ==========================================

    function updateUI() {
        const currentAnxiety = calculateAnxiety();
        const max = state.maxTolerance;
        const percentage = Math.min(Math.round((currentAnxiety / max) * 100), 100);

        // Actualizar métricas textuales
        currentAnxietyVal.textContent = `${currentAnxiety} pts`;
        maxToleranceVal.textContent = `${max} pts`;
        percentageVal.textContent = `${percentage}%`;

        // Función 3: Actualizar barra de progreso y estilos
        progressBar.style.width = `${percentage}%`;

        if (percentage < 40) {
            progressBar.style.backgroundColor = 'var(--color-success)';
            statusBadge.textContent = 'Zona de Calma';
            statusBadge.className = 'badge badge-success';
        } else if (percentage < 70) {
            progressBar.style.backgroundColor = 'var(--color-warning)';
            statusBadge.textContent = 'Atención Moderada';
            statusBadge.className = 'badge badge-warning';
        } else {
            progressBar.style.backgroundColor = 'var(--color-danger)';
            statusBadge.textContent = 'Nivel Elevado';
            statusBadge.className = 'badge badge-danger';
        }

        // Función 4: Alerta dinámica y sugerencias de respiración si supera el 70%
        if (percentage >= 70) {
            dynamicAlert.classList.remove('hidden');
        } else {
            dynamicAlert.classList.add('hidden');
        }

        // Renderizar Lista
        renderList();
    }

    function renderList() {
        itemsList.innerHTML = '';

        if (state.items.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        state.items.forEach(item => {
            const li = document.createElement('li');
            li.className = `list-item ${item.type} ${item.resolved ? 'resolved' : ''}`;

            const typeLabel = item.type === 'trigger' ? 'Disparador' : 'Estrategia';
            const impactSign = item.type === 'trigger' ? `+${item.impact}` : `-${item.impact}`;

            li.innerHTML = `
                <div class="item-info">
                    <span class="item-title">${escapeHTML(item.title)}</span>
                    <span class="item-meta">${typeLabel} • Impacto: ${impactSign} pts</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-resolve" data-id="${item.id}" title="${item.resolved ? 'Reactivar' : 'Marcar como Superado'}">
                        ${item.resolved ? '↩️ Reactivar' : '✓ Superado'}
                    </button>
                    <button class="btn-icon btn-delete" data-id="${item.id}" title="Eliminar">
                        🗑️
                    </button>
                </div>
            `;

            itemsList.appendChild(li);
        });
    }

    // Helper para prevenir XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Render Inicial
    updateUI();
});