import React, { useState, useEffect } from "react";
import axios from "axios";
import Snackbar from "./Snackbar";
import { BACKEND_URL } from "../config";
import './PaymentMethods.css';

/**
 * PaymentMethods Component
 * - Allows adding, editing, and deleting payment methods
 * - Similar to Expenses component but simpler
 */
export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [text, setText] = useState("");
  const [type, setType] = useState("");

  const [snackbar, setSnackbar] = useState(null);

  const paymentTypes = ["CreditCard", "DebitCard", "Paylater", "Bank", "Cash", "Others"];

  const fetchMethods = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/methods`, { withCredentials: true });
      if (response.status === 200) {
        const data = response.data.data || response.data || [];
        setMethods(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      // Don't show error for initial fetch, methods might not exist yet
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  async function submitMethod() {
    if (!text.trim()) {
      setSnackbar({ category: 'error', message: 'Payment method name is required' });
      return;
    }
    if (!type) {
      setSnackbar({ category: 'error', message: 'Please select a payment type' });
      return;
    }

    const methodData = {
      name: text.trim(),
      type: type
    };

    setIsSaving(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/methods`, methodData, { withCredentials: true });
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ category: 'success', message: 'Payment method added successfully!' });
        setText("");
        setType("");
        fetchMethods();
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
      const errorMsg = error.response?.data?.message || 'Failed to add payment method';
      setSnackbar({ category: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteMethod(methodId) {
    if (!window.confirm("Are you sure you want to delete this payment method?")) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/users/methods/${methodId}`, { withCredentials: true });
      if (response.status === 200) {
        setSnackbar({ category: 'success', message: 'Payment method deleted successfully!' });
        fetchMethods();
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
      const errorMsg = error.response?.data?.message || 'Failed to delete payment method';
      setSnackbar({ category: 'error', message: errorMsg });
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case "CreditCard": return "💳";
      case "DebitCard": return "🏦";
      case "Paylater": return "⏳";
      case "Bank": return "🏛️";
      case "Cash": return "💵";
      case "Others": return "🛠️";
      default: return "💰";
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case "CreditCard": return "Credit Card";
      case "DebitCard": return "Debit Card";
      case "Paylater": return "Pay Later";
      case "Bank": return "UPI/Bank Account";
      case "Cash": return "Cash";
      case "Others": return "Others";
      default: return type;
    }
  };

  return (
    <div className="payment-methods-container">
      <div className="payment-methods-header">
        <h3 className="payment-methods-title">
          <span className="payment-methods-icon">💳</span>
          Your Payment Instruments
        </h3>
      </div>

      <div className="payment-methods-grid">
        <div className="payment-methods-left">
          <div className="add-method-card">
            <h4 className="add-method-title">
              <span className="add-method-icon">➕</span>
              Add New Payment Instrument
            </h4>

            <div className="form-container">
              <div className="form-group">
                <label className="form-label">Payment Instrument Name *</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., HDFC Credit Card, SBI Account"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select payment type</option>
                  {paymentTypes.map(pt => (
                    <option key={pt} value={pt}>
                      {getTypeIcon(pt)} {getTypeLabel(pt)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={submitMethod}
                disabled={isSaving}
                className="submit-method-btn"
              >
                {isSaving ? 'Adding...' : '➕ Add Payment Method'}
              </button>
            </div>
          </div>
        </div>

        <div className="payment-methods-right">
          <div className="methods-list-card">
            <h4 className="methods-list-title">
              <span className="methods-list-icon">📋</span>
              Your Payment Instruments ({methods.length})
            </h4>

            <div className="methods-list-content">
              {isLoading ? (
                <div className="loading-methods">
                  Loading payment methods...
                </div>
              ) : methods.length === 0 ? (
                <div className="no-methods">
                  No payment methods added yet
                </div>
              ) : (
                <div className="methods-scroll">
                  {methods.map((method) => (
                    <div key={method._id} className="method-item">
                      <div className="method-header">
                        <div className="method-info">
                          <div className="method-icon-type">
                            {getTypeIcon(method.type)}
                          </div>
                          <div>
                            <h5 className="method-name">{method.text}</h5>
                            <div className="method-type-label">
                              {getTypeLabel(method.name)}
                            </div>
                          </div>
                        </div>
                        <div className="method-actions">
                          <button
                            onClick={() => handleDeleteMethod(method._id)}
                            className="delete-method-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {snackbar && (
        <Snackbar
          category={snackbar.category}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}
