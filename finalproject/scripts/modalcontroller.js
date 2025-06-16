// Modal Controller - manages modal dialogs with accessibility support
// ES Module for modal functionality with proper event handling

export class ModalController {
    constructor() {
        this.activeModal = null;
        this.previousFocus = null;
        this.keydownHandler = this.handleKeydown.bind(this);
    }

    initModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal with id "${modalId}" not found`);
            return;
        }

        // Find close button
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideModal(modalId);
            });
        }

        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modalId);
            }
        });

        // Prevent modal content click from closing modal
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        console.log(`Modal "${modalId}" initialized`);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        // Store the currently focused element
        this.previousFocus = document.activeElement;

        // Show modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Set active modal
        this.activeModal = modalId;

        // Add event listeners
        document.addEventListener('keydown', this.keydownHandler);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management - focus first focusable element in modal
        this.focusFirstElement(modal);

        console.log(`Modal "${modalId}" shown`);
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        // Hide modal
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        // Clear active modal
        this.activeModal = null;

        // Remove event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        
        // Restore body scroll
        document.body.style.overflow = '';

        // Restore focus to previous element
        if (this.previousFocus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }

        console.log(`Modal "${modalId}" hidden`);
    }

    handleKeydown(e) {
        if (!this.activeModal) return;

        const modal = document.getElementById(this.activeModal);
        if (!modal) return;

        // Close modal on Escape key
        if (e.key === 'Escape') {
            e.preventDefault();
            this.hideModal(this.activeModal);
            return;
        }

        // Trap focus within modal on Tab key
        if (e.key === 'Tab') {
            this.trapFocus(e, modal);
        }
    }

    trapFocus(e, modal) {
        const focusableElements = this.getFocusableElements(modal);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement) return;

        // If only one focusable element, prevent tabbing
        if (focusableElements.length === 1) {
            e.preventDefault();
            return;
        }

        // Shift + Tab: if focused on first element, go to last
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
            return;
        }

        // Tab: if focused on last element, go to first
        if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
            return;
        }
    }

    focusFirstElement(modal) {
        const focusableElements = this.getFocusableElements(modal);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    getFocusableElements(container) {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        const elements = container.querySelectorAll(focusableSelectors.join(', '));
        
        // Filter out hidden elements
        return Array.from(elements).filter(element => {
            return element.offsetWidth > 0 || 
                   element.offsetHeight > 0 || 
                   element.getClientRects().length > 0;
        });
    }

    // Utility method to check if any modal is open
    isModalOpen() {
        return this.activeModal !== null;
    }

    // Utility method to get current active modal
    getActiveModal() {
        return this.activeModal;
    }

    // Method to update modal content dynamically
    updateModalContent(modalId, title, body) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        const titleElement = modal.querySelector('.modal-header h3');
        const bodyElement = modal.querySelector('.modal-body');

        if (titleElement && title) {
            titleElement.textContent = title;
        }

        if (bodyElement && body) {
            if (typeof body === 'string') {
                bodyElement.innerHTML = body;
            } else if (body instanceof HTMLElement) {
                bodyElement.innerHTML = '';
                bodyElement.appendChild(body);
            }
        }
    }

    // Method to create and show a simple alert modal
    showAlert(title, message, buttonText = 'OK') {
        // Create modal if it doesn't exist
        let alertModal = document.getElementById('alert-modal');
        
        if (!alertModal) {
            alertModal = this.createAlertModal();
            document.body.appendChild(alertModal);
            this.initModal('alert-modal');
        }

        // Update content using template literals
        this.updateModalContent('alert-modal', title, `
            <div class="alert-content">
                <p>${message}</p>
                <div style="text-align: center; margin-top: 1.5rem;">
                    <button class="btn-primary" onclick="modalController.hideModal('alert-modal')">${buttonText}</button>
                </div>
            </div>
        `);

        this.showModal('alert-modal');
    }

    createAlertModal() {
        const modal = document.createElement('div');
        modal.id = 'alert-modal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'alert-modal-title');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="alert-modal-title">Alert</h3>
                    <button class="modal-close" aria-label="Close alert">&times;</button>
                </div>
                <div class="modal-body" id="alert-modal-body">
                    <!-- Alert content will be inserted here -->
                </div>
            </div>
        `;

        return modal;
    }

    // Method to show confirmation dialog
    showConfirmation(title, message, onConfirm, onCancel) {
        // Create confirmation modal if it doesn't exist
        let confirmModal = document.getElementById('confirm-modal');
        
        if (!confirmModal) {
            confirmModal = this.createConfirmModal();
            document.body.appendChild(confirmModal);
            this.initModal('confirm-modal');
        }

        // Update content
        this.updateModalContent('confirm-modal', title, `
            <div class="confirm-content">
                <p>${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn-primary" id="confirm-yes">Yes</button>
                    <button class="btn-secondary" id="confirm-no">No</button>
                </div>
            </div>
        `);

        // Add event listeners for buttons
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');

        if (yesBtn) {
            yesBtn.addEventListener('click', () => {
                this.hideModal('confirm-modal');
                if (onConfirm) onConfirm();
            });
        }

        if (noBtn) {
            noBtn.addEventListener('click', () => {
                this.hideModal('confirm-modal');
                if (onCancel) onCancel();
            });
        }

        this.showModal('confirm-modal');
    }

    createConfirmModal() {
        const modal = document.createElement('div');
        modal.id = 'confirm-modal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'confirm-modal-title');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="confirm-modal-title">Confirm</h3>
                    <button class="modal-close" aria-label="Close confirmation">&times;</button>
                </div>
                <div class="modal-body" id="confirm-modal-body">
                    <!-- Confirmation content will be inserted here -->
                </div>
            </div>
        `;

        return modal;
    }
}