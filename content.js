(function() {
    'use strict';

    // User Configuration
    const fieldsToCopy = [
        "Phone",
        "Email",
        "Case Number",
        "Vehicle Model",
        "Dealer Code",
        "Account Name",
        "Mailing Address",
        "Registration Number",
        "Warranty Start Date",
        "Warranty End Date",
        "VIN"
    ];

    /**
     * Extracts only the field value, ignoring edit buttons and hidden assistive text.
     */
    const handleCopy = (event) => {
        const button = event.currentTarget;
        const container = button.closest('.slds-form-element__control');
        
        if (!container) return;

        // Specifically target the value span to avoid copying "Edit VIN" etc.
        const valueSpan = container.querySelector('.test-id__field-value');
        
        let textToCopy = '';
        if (valueSpan) {
            // innerText excludes CSS hidden content, but we use it on the specific span 
            // to ensure siblings like the Edit button are never reached.
            textToCopy = valueSpan.innerText.trim();
        } else {
            // Fallback: cleaning up container text if standard span isn't found
            textToCopy = container.innerText.replace('📋', '').trim();
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalTitle = button.title;
            button.title = 'Copied!';
            button.innerText = '✅';
            setTimeout(() => {
                button.title = originalTitle;
                button.innerText = '📋';
            }, 1000);
        });
    };

    /**
     * Checks if a field should have a copy button based on the configuration.
     */
    const shouldAddButton = (element) => {
        // Find the label text for this form element
        const formElement = element.closest('.slds-form-element');
        if (!formElement) return false;
        
        const label = formElement.querySelector('.test-id__field-label');
        if (!label) return false;

        const labelText = label.innerText.trim();
        return fieldsToCopy.some(field => labelText.toLowerCase() === field.toLowerCase());
    };

    /**
     * Injects the copy button into qualified Salesforce fields.
     */
    const injectButtons = () => {
        const controls = document.querySelectorAll('.slds-form-element__control:not([data-has-copy-btn="true"])');

        controls.forEach(control => {
            if (shouldAddButton(control)) {
                control.setAttribute('data-has-copy-btn', 'true');
                
                // Ensure layout allows the button to sit at the end
                control.style.display = 'flex';
                control.style.alignItems = 'center';

                const btn = document.createElement('button');
                btn.className = 'copy-btn slds-button slds-button_icon';
                btn.innerText = '📋';
                
                // Get field name for the tooltip
                const label = control.closest('.slds-form-element').querySelector('.test-id__field-label');
                btn.title = `Copy ${label ? label.innerText : 'Field'}`;

                // Salesforce-consistent styling
                Object.assign(btn.style, {
                    marginLeft: '6px',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                    borderRadius: '0.25rem',
                    padding: '0px 4px',
                    background: 'white',
                    fontSize: '13px',
                    lineHeight: '1',
                    flexShrink: '0'
                });

                btn.addEventListener('click', handleCopy);
                control.appendChild(btn);
            }
        });
    };

    // Monitor for changes (Salesforce dynamic page loads)
    const observer = new MutationObserver(() => injectButtons());
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial injection
    injectButtons();
})();
