// Performs calculation based on operator
const calculate = (n1, operator, n2) => {
	const firstNum = parseFloat(n1);
	const secondNum = parseFloat(n2);
	if (operator === 'add') return firstNum + secondNum;
	if (operator === 'subtract') return firstNum - secondNum;
	if (operator === 'multiply') return firstNum * secondNum;
	if (operator === 'divide') return firstNum / secondNum;
};

// Determines the type of key pressed
const getKeyType = key => {
	const { action } = key.dataset;
	if (!action) return 'number';
	if (
		action === 'add' ||
		action === 'subtract' ||
		action === 'multiply' ||
		action === 'divide'
	)
		return 'operator';
	// For everything else, return the action
	return action;
};

// Creates the string to display based on key pressed and state
const createResultString = (key, displayedNum, state) => {
	const keyContent = key.textContent;
	const keyType = getKeyType(key);
	const { firstValue, operator, modValue, previousKeyType } = state;

	if (keyType === 'number') {
		// Start new number or append digit
		return displayedNum === '0' ||
			previousKeyType === 'operator' ||
			previousKeyType === 'calculate'
			? keyContent
			: displayedNum + keyContent;
	}

	if (keyType === 'decimal') {
		// Add decimal if not present
		if (!displayedNum.includes('.')) return displayedNum + '.';
		// Start new decimal number after operator/calculate
		if (previousKeyType === 'operator' || previousKeyType === 'calculate')
			return '0.';
		return displayedNum;
	}

	if (keyType === 'operator') {
		// Calculate if operator chain, else keep displayed number
		return firstValue &&
			operator &&
			previousKeyType !== 'operator' &&
			previousKeyType !== 'calculate'
			? calculate(firstValue, operator, displayedNum)
			: displayedNum;
	}

	if (keyType === 'clear') return 0; // Reset display

	if (keyType === 'calculate') {
		// Perform calculation or repeat last calculation
		return firstValue
			? previousKeyType === 'calculate'
				? calculate(displayedNum, operator, modValue)
				: calculate(firstValue, operator, displayedNum)
			: displayedNum;
	}
};

// Updates calculator's internal state after key press
const updateCalculatorState = (
	key,
	calculator,
	calculatedValue,
	displayedNum
) => {
	const keyType = getKeyType(key);
	const { firstValue, operator, modValue, previousKeyType } = calculator.dataset;

	calculator.dataset.previousKeyType = keyType;

	if (keyType === 'operator') {
		// Store operator and first value
		calculator.dataset.operator = key.dataset.action;
		calculator.dataset.firstValue =
			firstValue &&
			operator &&
			previousKeyType !== 'operator' &&
			previousKeyType !== 'calculate'
				? calculatedValue
				: displayedNum;
	}

	if (keyType === 'calculate') {
		// Store modValue for repeated calculations
		calculator.dataset.modValue =
			firstValue && previousKeyType === 'calculate' ? modValue : displayedNum;
	}

	if (keyType === 'clear' && key.textContent === 'AC') {
		// Reset all state
		calculator.dataset.firstValue = '';
		calculator.dataset.modValue = '';
		calculator.dataset.operator = '';
		calculator.dataset.previousKeyType = '';
	}
};

// Updates button styles and clear button text
const updateVisualState = (key, calculator) => {
	const keyType = getKeyType(key);
	Array.from(key.parentNode.children).forEach(k =>
		k.classList.remove('is-depressed')
	);

	if (keyType === 'operator') key.classList.add('is-depressed');
	if (keyType === 'clear' && key.textContent !== 'AC') key.textContent = 'AC';
	if (keyType !== 'clear') {
		const clearButton = calculator.querySelector('[data-action=clear]');
		clearButton.textContent = 'CE';
	}
};

// DOM element references
const calculator = document.querySelector('.calculator');
const display = calculator.querySelector('.calculator__display');
const keys = calculator.querySelector('.calculator__keys');

// Main event listener for button clicks
keys.addEventListener('click', e => {
	if (!e.target.matches('button')) return;
	const key = e.target;
	const displayedNum = display.textContent;
	const resultString = createResultString(key, displayedNum, calculator.dataset);

	display.textContent = resultString;
	updateCalculatorState(key, calculator, resultString, displayedNum);
	updateVisualState(key, calculator);
});
