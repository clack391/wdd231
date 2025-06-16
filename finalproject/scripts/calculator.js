// Calculators - handles mortgage and rent affordability calculators
// ES Module for financial calculation functionality

import { StorageManager } from './storagemanager.js';

class CalculatorManager {
    constructor() {
        this.storageManager = new StorageManager();
        this.init();
    }

    init() {
        this.initMortgageCalculator();
        this.initRentCalculator();
        console.log('Calculator manager initialized');
    }

    initMortgageCalculator() {
        const mortgageForm = document.getElementById('mortgage-calculator');
        if (!mortgageForm) return;

        mortgageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateMortgage();
        });

        // Add input event listeners for real-time validation
        const inputs = mortgageForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateMortgageInput(input);
            });
        });
    }

    initRentCalculator() {
        const rentForm = document.getElementById('rent-calculator');
        if (!rentForm) return;

        rentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateRentAffordability();
        });

        // Add input event listeners for real-time validation
        const inputs = rentForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateRentInput(input);
            });
        });
    }

    calculateMortgage() {
        try {
            // Get form values
            const homePrice = parseFloat(document.getElementById('home-price').value);
            const downPayment = parseFloat(document.getElementById('down-payment').value);
            const interestRate = parseFloat(document.getElementById('interest-rate').value);
            const loanTerm = parseInt(document.getElementById('loan-term').value);

            // Validate inputs
            if (!this.validateMortgageInputs(homePrice, downPayment, interestRate, loanTerm)) {
                return;
            }

            // Calculate loan amount
            const loanAmount = homePrice - downPayment;

            // Calculate monthly payment using mortgage formula
            const monthlyRate = interestRate / 100 / 12;
            const numPayments = loanTerm * 12;

            let monthlyPayment;
            if (monthlyRate === 0) {
                monthlyPayment = loanAmount / numPayments;
            } else {
                monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                (Math.pow(1 + monthlyRate, numPayments) - 1);
            }

            // Calculate additional costs
            const totalPaid = monthlyPayment * numPayments;
            const totalInterest = totalPaid - loanAmount;
            const downPaymentPercent = (downPayment / homePrice) * 100;

            // Estimate property tax and insurance (rough estimates for Idaho)
            const monthlyPropertyTax = (homePrice * 0.0069) / 12; // 0.69% annual rate
            const monthlyInsurance = (homePrice * 0.003) / 12; // 0.3% annual rate
            const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyInsurance;

            // Create results object
            const results = {
                monthlyPayment: monthlyPayment,
                totalMonthlyPayment: totalMonthlyPayment,
                monthlyPropertyTax: monthlyPropertyTax,
                monthlyInsurance: monthlyInsurance,
                totalPaid: totalPaid,
                totalInterest: totalInterest,
                loanAmount: loanAmount,
                downPaymentPercent: downPaymentPercent
            };

            // Display results
            this.displayMortgageResults(results);

            // Save to calculator history
            const inputs = { homePrice, downPayment, interestRate, loanTerm };
            this.storageManager.addCalculatorResult('mortgage', inputs, results);

            console.log('Mortgage calculation completed', results);

        } catch (error) {
            console.error('Error calculating mortgage:', error);
            this.showCalculatorError('mortgage-result', 'Error calculating mortgage payment. Please check your inputs.');
        }
    }

    calculateRentAffordability() {
        try {
            // Get form values
            const monthlyIncome = parseFloat(document.getElementById('monthly-income').value);
            const debtPayments = parseFloat(document.getElementById('debt-payments').value);
            const rentPercentage = parseInt(document.getElementById('rent-percentage').value);

            // Validate inputs
            if (!this.validateRentInputs(monthlyIncome, debtPayments, rentPercentage)) {
                return;
            }

            // Calculate disposable income
            const disposableIncome = monthlyIncome - debtPayments;

            // Calculate maximum rent based on percentage
            const maxRent = (monthlyIncome * rentPercentage) / 100;

            // Calculate recommended rent (more conservative)
            const recommendedMaxRent = Math.min(maxRent, disposableIncome * 0.3);

            // Calculate different scenarios
            const scenarios = [
                { name: 'Conservative (25%)', rent: (monthlyIncome * 25) / 100 },
                { name: 'Recommended (30%)', rent: (monthlyIncome * 30) / 100 },
                { name: 'Maximum (35%)', rent: (monthlyIncome * 35) / 100 }
            ];

            // Create results object
            const results = {
                monthlyIncome: monthlyIncome,
                debtPayments: debtPayments,
                disposableIncome: disposableIncome,
                maxRent: maxRent,
                recommendedMaxRent: recommendedMaxRent,
                selectedPercentage: rentPercentage,
                scenarios: scenarios
            };

            // Display results
            this.displayRentResults(results);

            // Save to calculator history
            const inputs = { monthlyIncome, debtPayments, rentPercentage };
            this.storageManager.addCalculatorResult('rent', inputs, results);

            console.log('Rent affordability calculation completed', results);

        } catch (error) {
            console.error('Error calculating rent affordability:', error);
            this.showCalculatorError('rent-result', 'Error calculating rent affordability. Please check your inputs.');
        }
    }

    displayMortgageResults(results) {
        const resultDiv = document.getElementById('mortgage-result');
        if (!resultDiv) return;

        // Using template literals for dynamic content generation
        resultDiv.innerHTML = `
            <h4>Mortgage Payment Breakdown</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div class="result-item">
                    <strong>Principal & Interest:</strong><br>
                    <span style="font-size: 1.25rem; color: #2563eb;">$${results.monthlyPayment.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <strong>Property Tax (est.):</strong><br>
                    <span style="font-size: 1rem; color: #4b5563;">$${results.monthlyPropertyTax.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <strong>Insurance (est.):</strong><br>
                    <span style="font-size: 1rem; color: #4b5563;">$${results.monthlyInsurance.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <strong>Total Monthly:</strong><br>
                    <span style="font-size: 1.25rem; color: #059669; font-weight: 600;">$${results.totalMonthlyPayment.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                <h5 style="margin-bottom: 0.5rem;">Loan Summary</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; font-size: 0.875rem;">
                    <div><strong>Loan Amount:</strong> $${results.loanAmount.toLocaleString()}</div>
                    <div><strong>Down Payment:</strong> ${results.downPaymentPercent.toFixed(1)}%</div>
                    <div><strong>Total Interest:</strong> $${results.totalInterest.toLocaleString()}</div>
                    <div><strong>Total Paid:</strong> $${results.totalPaid.toLocaleString()}</div>
                </div>
            </div>
            
            <div style="margin-top: 1rem; padding: 0.75rem; background-color: #dbeafe; border-left: 4px solid #2563eb; border-radius: 0.25rem;">
                <p style="margin: 0; font-size: 0.875rem; color: #1e40af;">
                    <strong>Note:</strong> Property tax and insurance are estimates based on Idaho averages. 
                    Actual costs may vary. Consider additional costs like HOA fees, maintenance, and utilities.
                </p>
            </div>
        `;

        resultDiv.classList.add('show');
    }

    displayRentResults(results) {
        const resultDiv = document.getElementById('rent-result');
        if (!resultDiv) return;

        // Using template literals for dynamic content generation
        resultDiv.innerHTML = `
            <h4>Rent Affordability Analysis</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div class="result-item">
                    <strong>Monthly Income:</strong><br>
                    <span style="font-size: 1.125rem; color: #374151;">$${results.monthlyIncome.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <strong>Debt Payments:</strong><br>
                    <span style="font-size: 1.125rem; color: #dc2626;">$${results.debtPayments.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <strong>Available Income:</strong><br>
                    <span style="font-size: 1.125rem; color: #059669;">$${results.disposableIncome.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <strong>Recommended Max Rent:</strong><br>
                    <span style="font-size: 1.25rem; color: #2563eb; font-weight: 600;">$${results.recommendedMaxRent.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h5>Rent Scenarios</h5>
                <div style="display: grid; gap: 0.5rem;">
                    ${results.scenarios.map(scenario => {
                        const isAffordable = scenario.rent <= results.disposableIncome;
                        const statusColor = isAffordable ? '#059669' : '#dc2626';
                        const statusIcon = isAffordable ? '✅' : '⚠️';
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background-color: #f9fafb; border-radius: 0.25rem;">
                                <span>${scenario.name}:</span>
                                <span style="color: ${statusColor}; font-weight: 500;">
                                    ${statusIcon} $${scenario.rent.toFixed(2)}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem;">
                <h5 style="margin-bottom: 0.5rem;">Budget Breakdown</h5>
                <div style="font-size: 0.875rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>Total Income:</span>
                        <span>$${results.monthlyIncome.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>Debt Payments:</span>
                        <span style="color: #dc2626;">-$${results.debtPayments.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>Recommended Rent:</span>
                        <span style="color: #dc2626;">-$${results.recommendedMaxRent.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: 600; border-top: 1px solid #d1d5db; padding-top: 0.25rem;">
                        <span>Remaining for expenses:</span>
                        <span style="color: #059669;">$${(results.disposableIncome - results.recommendedMaxRent).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 1rem; padding: 0.75rem; background-color: #dbeafe; border-left: 4px solid #2563eb; border-radius: 0.25rem;">
                <p style="margin: 0; font-size: 0.875rem; color: #1e40af;">
                    <strong>Tip:</strong> Remember to budget for utilities, groceries, transportation, and emergency savings. 
                    The 30% rule is a guideline - consider your total financial picture.
                </p>
            </div>
        `;

        resultDiv.classList.add('show');
    }

    validateMortgageInputs(homePrice, downPayment, interestRate, loanTerm) {
        if (isNaN(homePrice) || homePrice <= 0) {
            this.showCalculatorError('mortgage-result', 'Please enter a valid home price.');
            return false;
        }

        if (isNaN(downPayment) || downPayment < 0) {
            this.showCalculatorError('mortgage-result', 'Please enter a valid down payment amount.');
            return false;
        }

        if (downPayment >= homePrice) {
            this.showCalculatorError('mortgage-result', 'Down payment cannot be greater than or equal to home price.');
            return false;
        }

        if (isNaN(interestRate) || interestRate < 0 || interestRate > 20) {
            this.showCalculatorError('mortgage-result', 'Please enter a valid interest rate between 0% and 20%.');
            return false;
        }

        if (isNaN(loanTerm) || loanTerm <= 0) {
            this.showCalculatorError('mortgage-result', 'Please select a valid loan term.');
            return false;
        }

        return true;
    }

    validateRentInputs(monthlyIncome, debtPayments, rentPercentage) {
        if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
            this.showCalculatorError('rent-result', 'Please enter a valid monthly income.');
            return false;
        }

        if (isNaN(debtPayments) || debtPayments < 0) {
            this.showCalculatorError('rent-result', 'Please enter a valid debt payment amount.');
            return false;
        }

        if (debtPayments >= monthlyIncome) {
            this.showCalculatorError('rent-result', 'Debt payments cannot be greater than or equal to monthly income.');
            return false;
        }

        if (isNaN(rentPercentage) || rentPercentage <= 0 || rentPercentage > 100) {
            this.showCalculatorError('rent-result', 'Please select a valid rent percentage.');
            return false;
        }

        return true;
    }

    validateMortgageInput(input) {
        const value = parseFloat(input.value);
        let isValid = true;
        let message = '';

        switch (input.id) {
            case 'home-price':
                isValid = !isNaN(value) && value > 0;
                message = isValid ? '' : 'Enter a valid home price';
                break;
            case 'down-payment':
                isValid = !isNaN(value) && value >= 0;
                message = isValid ? '' : 'Enter a valid down payment';
                break;
            case 'interest-rate':
                isValid = !isNaN(value) && value >= 0 && value <= 20;
                message = isValid ? '' : 'Enter a rate between 0% and 20%';
                break;
        }

        this.updateInputValidation(input, isValid, message);
    }

    validateRentInput(input) {
        const value = parseFloat(input.value);
        let isValid = true;
        let message = '';

        switch (input.id) {
            case 'monthly-income':
                isValid = !isNaN(value) && value > 0;
                message = isValid ? '' : 'Enter a valid monthly income';
                break;
            case 'debt-payments':
                isValid = !isNaN(value) && value >= 0;
                message = isValid ? '' : 'Enter a valid debt payment amount';
                break;
        }

        this.updateInputValidation(input, isValid, message);
    }

    updateInputValidation(input, isValid, message) {
        // Remove existing validation classes
        input.classList.remove('input-valid', 'input-invalid');
        
        // Add appropriate class
        if (input.value.trim() !== '') {
            input.classList.add(isValid ? 'input-valid' : 'input-invalid');
        }

        // Show/hide error message
        let errorElement = input.parentNode.querySelector('.input-error');
        if (message && !isValid) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'input-error';
                errorElement.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
                input.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
        } else if (errorElement) {
            errorElement.remove();
        }
    }

    showCalculatorError(resultId, message) {
        const resultDiv = document.getElementById(resultId);
        if (!resultDiv) return;

        resultDiv.innerHTML = `
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem;">
                <div style="display: flex; align-items: center;">
                    <span style="color: #dc2626; font-size: 1.25rem; margin-right: 0.5rem;">⚠️</span>
                    <span style="color: #991b1b; font-weight: 500;">${message}</span>
                </div>
            </div>
        `;

        resultDiv.classList.add('show');
    }

    // Utility method to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Method to get calculator history
    getCalculatorHistory() {
        return this.storageManager.getCalculatorHistory();
    }

    // Method to clear calculator history
    clearCalculatorHistory() {
        return this.storageManager.clearCalculatorHistory();
    }
}

// Initialize calculator manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the resources page
    if (document.getElementById('mortgage-calculator') || document.getElementById('rent-calculator')) {
        new CalculatorManager();
    }
});

export { CalculatorManager };