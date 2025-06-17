// Modal manager for handling modal dialogs
export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });

        // Prevent modal content clicks from closing modal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-content')) {
                e.stopPropagation();
            }
        });

        // Handle close button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.closest('.modal-close')) {
                this.closeModal();
            }
        });
    }

    showModal(modalId, title = '', content = '') {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id '${modalId}' not found`);
            return;
        }

        // Update modal content
        const modalTitle = modal.querySelector('#modalTitle');
        const modalBody = modal.querySelector('#modalBody');

        if (modalTitle && title) {
            modalTitle.textContent = title;
        }

        if (modalBody && content) {
            modalBody.innerHTML = content;
        }

        // Show modal
        modal.classList.add('active');
        this.activeModal = modal;

        // Prevent background scrolling
        document.body.style.overflow = 'hidden';

        // Focus management for accessibility
        this.trapFocus(modal);

        // Announce to screen readers
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus the close button for keyboard navigation
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }
    }

    closeModal() {
        if (!this.activeModal) return;

        // Hide modal
        this.activeModal.classList.remove('active');
        this.activeModal.setAttribute('aria-hidden', 'true');

        // Restore background scrolling
        document.body.style.overflow = '';

        // Clear active modal
        this.activeModal = null;

        // Return focus to the element that opened the modal
        const focusElement = document.querySelector('[data-focus-return]');
        if (focusElement) {
            focusElement.focus();
            focusElement.removeAttribute('data-focus-return');
        }
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        };

        // Remove existing listener if any
        modal.removeEventListener('keydown', modal._focusTrapHandler);
        
        // Add new listener
        modal._focusTrapHandler = handleTabKey;
        modal.addEventListener('keydown', handleTabKey);
    }

    createModal(id, title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        if (title) {
            modal.setAttribute('aria-labelledby', `${id}-title`);
        }

        const modalHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="${id}-title">${title}</h3>
                    <button class="modal-close" aria-label="Close modal" type="button">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        modal.innerHTML = modalHTML;

        // Add custom CSS classes if provided
        if (options.className) {
            modal.classList.add(...options.className.split(' '));
        }

        // Add to DOM
        document.body.appendChild(modal);

        return modal;
    }

    showConfirmModal(message, onConfirm, onCancel = null) {
        const modalId = 'confirmModal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            const content = `
                <div style="text-align: center; padding: 1rem;">
                    <p style="margin-bottom: 2rem; font-size: 1.1rem;">${message}</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn-primary" id="confirmYes">Yes</button>
                        <button class="btn-secondary" id="confirmNo">No</button>
                    </div>
                </div>
            `;
            modal = this.createModal(modalId, 'Confirm Action', content);
        } else {
            const messageElement = modal.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }

        // Set up event handlers
        const yesButton = modal.querySelector('#confirmYes');
        const noButton = modal.querySelector('#confirmNo');

        const handleYes = () => {
            if (onConfirm) onConfirm();
            this.closeModal();
            cleanup();
        };

        const handleNo = () => {
            if (onCancel) onCancel();
            this.closeModal();
            cleanup();
        };

        const cleanup = () => {
            yesButton.removeEventListener('click', handleYes);
            noButton.removeEventListener('click', handleNo);
        };

        yesButton.addEventListener('click', handleYes);
        noButton.addEventListener('click', handleNo);

        this.showModal(modalId);
    }

    showAlertModal(message, title = 'Alert') {
        const modalId = 'alertModal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            const content = `
                <div style="text-align: center; padding: 1rem;">
                    <p style="margin-bottom: 2rem; font-size: 1.1rem;">${message}</p>
                    <button class="btn-primary" id="alertOk">OK</button>
                </div>
            `;
            modal = this.createModal(modalId, title, content);
        } else {
            const messageElement = modal.querySelector('p');
            const titleElement = modal.querySelector(`#${modalId}-title`);
            if (messageElement) messageElement.textContent = message;
            if (titleElement) titleElement.textContent = title;
        }

        // Set up event handler
        const okButton = modal.querySelector('#alertOk');
        const handleOk = () => {
            this.closeModal();
            okButton.removeEventListener('click', handleOk);
        };

        okButton.addEventListener('click', handleOk);
        this.showModal(modalId);
    }

    isModalOpen() {
        return this.activeModal !== null;
    }

    getActiveModal() {
        return this.activeModal;
    }

    closeAllModals() {
        const openModals = document.querySelectorAll('.modal.active');
        openModals.forEach(modal => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        });

        this.activeModal = null;
        document.body.style.overflow = '';
    }
}