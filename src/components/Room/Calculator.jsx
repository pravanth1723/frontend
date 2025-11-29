import React, { useState } from 'react';
import './Calculator.css';

export default function Calculator({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="calculator-overlay">
      <div className="calculator">
        <div className="calculator-header">
          <h3 className="calculator-title">Calculator</h3>
          <button className="calculator-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="calculator-display">
          {display}
        </div>
        
        <div className="calculator-buttons">
          <button className="calc-btn clear" onClick={clear}>C</button>
          <button className="calc-btn operation" onClick={() => performOperation('÷')}>÷</button>
          <button className="calc-btn operation" onClick={() => performOperation('×')}>×</button>
          <button className="calc-btn operation" onClick={() => performOperation('-')}>-</button>
          
          <button className="calc-btn number" onClick={() => inputNumber(7)}>7</button>
          <button className="calc-btn number" onClick={() => inputNumber(8)}>8</button>
          <button className="calc-btn number" onClick={() => inputNumber(9)}>9</button>
          <button className="calc-btn operation plus" onClick={() => performOperation('+')} rowSpan="2">+</button>
          
          <button className="calc-btn number" onClick={() => inputNumber(4)}>4</button>
          <button className="calc-btn number" onClick={() => inputNumber(5)}>5</button>
          <button className="calc-btn number" onClick={() => inputNumber(6)}>6</button>
          
          <button className="calc-btn number" onClick={() => inputNumber(1)}>1</button>
          <button className="calc-btn number" onClick={() => inputNumber(2)}>2</button>
          <button className="calc-btn number" onClick={() => inputNumber(3)}>3</button>
          <button className="calc-btn equals" onClick={handleEquals} rowSpan="2">=</button>
          
          <button className="calc-btn number zero" onClick={() => inputNumber(0)}>0</button>
          <button className="calc-btn number" onClick={inputDecimal}>.</button>
        </div>
        
        <div className="calculator-result">
          <button 
            className="use-result-btn"
            onClick={() => {
              // You can customize this to copy to clipboard or pass the value
              navigator.clipboard.writeText(display);
              onClose();
            }}
          >
            Copy Result
          </button>
        </div>
      </div>
    </div>
  );
}
