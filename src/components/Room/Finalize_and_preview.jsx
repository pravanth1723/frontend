import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";
import { BACKEND_URL } from "../../config";
import "./Finalize_and_preview.css";
import { SETTLEMENT_MODES } from "./Settlement/settlementModes";
import { netSettlement } from "./Settlement/netSettlement";
import { peerToPeerSettlement } from "./Settlement/peerToPeerSettlement";
import { organizerSettlement } from "./Settlement/organizerSettlement";
import SettlementToggle from "./Settlement/SettlementToggle";
import SettlementTable from "./Settlement/SettlementTable";

/**
 * Step 3 - Preview
 * Fetches room data and expenses, displays in tabular format for PDF printing
 */
export default function PreviewStep() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [settlementMode, setSettlementMode] = useState(SETTLEMENT_MODES.NET);

  const [roomData, setRoomData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingOrganizer, setIsCalculatingOrganizer] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  // derive organizer early so other functions can consistently use it
  const organizer = roomData?.organizer || '';

  function downloadPDF() {
    const title = roomData?.title || 'expense_report';
    const filename = `${title.replace(/\s+/g, '_')}.pdf`;

    // Temporarily set document title for PDF
    const originalTitle = document.title;
    document.title = filename;

    // Trigger print dialog
    window.print();

    // Restore original title after a short delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  }

  async function calculateBestOrganizer() {
    setIsCalculatingOrganizer(true);
    try {
      // Call the calculate best organizer API
      const response = await axios.get(`${BACKEND_URL}/api/rooms/cal-best-organizer/${roomId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        const bestOrganizer = response.data.data.bestOrganizer;
        const currentOrganizer = roomData.organizer;

        // Show confirmation dialog
        const confirmMessage = `The system recommends "${bestOrganizer}" as the best organizer.${currentOrganizer !== bestOrganizer ? `\n\nThis will change the organizer from "${currentOrganizer}" to "${bestOrganizer}".` : '\n\nThis is the same as the current organizer.'}\n\nDo you want to proceed with this change?`;

        const isConfirmed = window.confirm(confirmMessage);

        if (isConfirmed) {
          // Call PUT API to update the organizer
          const updateResponse = await axios.put(`${BACKEND_URL}/api/rooms/${roomId}`, {
            ...roomData,
            organizer: bestOrganizer
          }, { withCredentials: true });

          if (updateResponse.status === 200) {
            setSnackbar({
              category: 'success',
              message: `Organizer updated to "${bestOrganizer}" successfully!`
            });

            // Refresh the data to get updated calculations
            await fetchData();
          }
        } else {
          setSnackbar({
            category: 'info',
            message: 'Organizer change cancelled by user.'
          });
        }
      }
    } catch (error) {
      console.error('Error calculating best organizer:', error);
      const errorMsg = error.response?.data?.message || 'Failed to calculate best organizer';
      setSnackbar({ category: 'error', message: errorMsg });
    } finally {
      setIsCalculatingOrganizer(false);
    }
  }

  // memoize fetchData so it can be safely used in useEffect and elsewhere
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch room metadata
      const roomRes = await axios.get(`${BACKEND_URL}/api/rooms/${roomId}`, { withCredentials: true });
      setRoomData(roomRes.data.data);

      // Fetch expenses for this room
      const expenseRes = (await axios.get(`${BACKEND_URL}/api/expenses/by-room-id/${roomId}`, { withCredentials: true })).data;

      // Check if expenses array is empty
      if (!expenseRes.data || expenseRes.data.length === 0) {
        setSnackbar({ category: 'error', message: 'No expenses added yet. Please add expenses first.' });
        setTimeout(() => {
          navigate(`/room/${roomId}/step2`);
        }, 2000);
        return;
      }

      setExpenses(expenseRes.data);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ category: 'error', message: 'Failed to load data. Please try again.' });
      setIsLoading(false);
    }
  }, [roomId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  function calculateBalances() {
    if (!roomData || !expenses.length) return { userPaidMap: {}, userOwesMap: {}, userExpenses: {} };

    const members = roomData.members || [];

    // Calculate how much each person paid
    const userPaidMap = {};
    members.forEach(m => userPaidMap[m] = 0);

    expenses.forEach(exp => {
      exp.spentBy.forEach(payer => {
        if (!userPaidMap[payer.name]) userPaidMap[payer.name] = 0;
        userPaidMap[payer.name] += payer.amount;
      });
    });

    // Calculate how much each person owes (their share)
    const userOwesMap = {};
    members.forEach(m => userOwesMap[m] = 0);

    expenses.forEach(exp => {
      exp.spentFor.forEach(person => {
        if (!userOwesMap[person.name]) userOwesMap[person.name] = 0;
        userOwesMap[person.name] += person.amount;
      });
    });

    // Calculate balance (what they owe to organizer or are owed)
    const finalBalance = {};
    members.forEach(m => {
      const paid = userPaidMap[m] || 0;
      const owes = userOwesMap[m] || 0;
      finalBalance[m] = owes - paid; // positive means they owe, negative means they paid extra
    });

    // Group expenses by person
    const userExpenses = {};
    members.forEach(m => userExpenses[m] = []);

    expenses.forEach(exp => {
      exp.spentFor.forEach(person => {
        if (userExpenses[person.name]) {
          userExpenses[person.name].push({
            description: exp.description,
            amount: person.amount,
            total: exp.total
          });
        }
      });
    });

    return { userPaidMap, userOwesMap, finalBalance, userExpenses };
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner size="large" color="var(--primary)" />
        <div className="loading-text">Loading preview...</div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <div className="error-text">Room not found</div>
      </div>
    );
  }

  const { userPaidMap, userOwesMap, finalBalance, userExpenses } = calculateBalances();
  let settlements = [];

  if (settlementMode === SETTLEMENT_MODES.NET) {
    settlements = netSettlement(finalBalance);
  } else if (settlementMode === SETTLEMENT_MODES.P2P) {
    settlements = peerToPeerSettlement(expenses);
  } else if (settlementMode === SETTLEMENT_MODES.ORGANIZER) {
    settlements = organizerSettlement(finalBalance, organizer);
  }

  const members = roomData.members || [];


  return (
    <div className="finalize-page-container">
      {/* Header Section - Room Info */}
      <div className="header-section">
        <div className="header-content">
          <div className="header-info">
            <h3 className="header-title">
              <span className="header-icon">📊</span>
              Finalize & Preview
            </h3>
            <div className="room-info-card">
              <div className="room-title">
                {roomData.title || "(untitled)"}
              </div>
              <div className="room-details">
                <div>
                  <span className="detail-label">👑 Organizer:</span> {organizer || "(none)"}
                </div>
                <div>
                  <span className="detail-label">👥 Members:</span> {members.join(", ")}
                </div>
                {roomData.notes && (
                  <div className="room-notes">
                    <span className="detail-label">📝 Notes:</span> {roomData.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="action-buttons">
            {roomData?.kind !== 'personal' && (
              <button
                onClick={calculateBestOrganizer}
                disabled={isCalculatingOrganizer}
                className={`calculate-organizer-btn ${isCalculatingOrganizer ? 'calculating' : ''}`}
              >
                {isCalculatingOrganizer ? (
                  <>
                    <Spinner size="small" color="#ffffff" />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🎯</span>
                    <span>Calculate Best Organizer</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={downloadPDF}
              className="download-pdf-btn"
            >
              <span className="button-icon">📥</span>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* All Expenses Table */}
      <div className="table-container">
        <h4 className="table-title">
          <span className="table-icon">💰</span>
          All Expenses
        </h4>
        {expenses.length === 0 ? (
          <div style={{
            color: '#9ca3af',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            No expenses added yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #e5e7eb',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>#</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Paid By</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderRadius: '0 8px 0 0' }}>Split Among</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={exp._id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#667eea' }}>{i + 1}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{exp.description}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                      ₹{exp.total.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                      {exp.spentBy.map((p, idx) => (
                        <div key={idx} style={{ marginBottom: '2px' }}>
                          <span style={{ fontWeight: '500' }}>{p.name}:</span> ₹{p.amount.toFixed(2)}
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                      {exp.spentFor.map((p, idx) => (
                        <div key={idx} style={{ marginBottom: '2px' }}>
                          <span style={{ fontWeight: '500' }}>{p.name}:</span> ₹{p.amount.toFixed(2)}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{
                  borderTop: '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  fontWeight: 'bold'
                }}>
                  <td colSpan="2" style={{ padding: '12px', fontSize: '1.1rem' }}>Total</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '1.2rem', color: '#059669' }}>
                    ₹{expenses.reduce((sum, exp) => sum + exp.total, 0).toFixed(2)}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Per-person Expense Breakdown */}
      {roomData?.kind !== 'personal' && (
        <div className="table-container">
          <h4 className="table-title">
            <span className="table-icon">👤</span>
            Individual Expense Breakdown
          </h4>
          {members.map(member => {
            const personExpenses = userExpenses[member] || [];
            const totalShare = userOwesMap[member] || 0;
            const totalPaid = userPaidMap[member] || 0;

            return (
              <div key={member} style={{
                marginBottom: '20px',
                padding: '16px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '10px',
                border: '2px solid #fbbf24',
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
              }}>
                <div style={{
                  fontWeight: '700',
                  marginBottom: '12px',
                  fontSize: '1.1rem',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{member === organizer ? '👑' : '👤'}</span>
                  {member}
                  {member === organizer && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#78350f',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Organizer
                    </span>
                  )}
                </div>

                {personExpenses.length === 0 ? (
                  <div style={{
                    color: '#92400e',
                    fontStyle: 'italic',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    No expenses for this person
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <table style={{ width: '100%', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #fbbf24' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#92400e' }}>#</th>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#92400e' }}>Expense</th>
                          <th style={{ padding: '8px', textAlign: 'right', color: '#92400e' }}>Share Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personExpenses.map((exp, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #fde68a' }}>
                            <td style={{ padding: '8px', fontWeight: '600', color: '#78350f' }}>{idx + 1}</td>
                            <td style={{ padding: '8px', color: '#92400e' }}>{exp.description}</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#92400e' }}>
                              ₹{exp.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid #fbbf24', fontWeight: 'bold' }}>
                          <td colSpan="2" style={{ padding: '8px', color: '#78350f' }}>Total Share</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontSize: '1.05rem', color: '#78350f' }}>
                            ₹{totalShare.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                <div style={{
                  marginTop: '12px',
                  fontSize: '0.95rem',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '6px',
                  color: '#78350f',
                  fontWeight: '600'
                }}>
                  💳 Total Paid: ₹{totalPaid.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>)}

      {/* Final Settlement Table */}
      {/* Final Settlement (Multiple Modes) */}
      {roomData?.kind !== "personal" && (
        <div className="table-container">
          <h4 className="table-title">
            <span className="table-icon">💸</span>
            Final Settlement
          </h4>

          {/* Mode Toggle */}
          <SettlementToggle
            mode={settlementMode}
            setMode={setSettlementMode}
          />

          {/* Settlement Result Table */}
          <SettlementTable settlements={settlements} />

          {/* Info box */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#eff6ff",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
              fontSize: "0.9rem",
              display: "flex",
              gap: "8px",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>💡</span>
            <span>
              <b>Net</b>: Fewest transactions (recommended)<br />
              <b>Peer to Peer</b>: Standard UPI-style peer payments<br />
              <b>Organizer</b>: Everyone settles with organizer
            </span>
          </div>
        </div>
      )}


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
