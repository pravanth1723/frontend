import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

/**
 * Step 3 - Preview
 * Fetches room data and expenses, displays in tabular format for PDF printing
 */
export default function PreviewStep() {
  const { roomId } = useParams();
  
  const [roomData, setRoomData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, [roomId]);

  async function fetchData() {
    try {
      setIsLoading(true);
      
      // Fetch room metadata
      const roomRes = await axios.get(`http://localhost:5000/api/rooms/${roomId}`, { withCredentials: true });
      setRoomData(roomRes.data);
      
      // Fetch expenses for this room
      const expenseRes = await axios.get(`http://localhost:5000/api/expenses/by-room-id/${roomId}`, { withCredentials: true });
      setExpenses(expenseRes.data);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  }

  function calculateBalances() {
    if (!roomData || !expenses.length) return { userPaidMap: {}, userOwesMap: {}, userExpenses: {} };
    
    const members = roomData.members || [];
    const organizer = roomData.organizer || '';
    
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
      <div className="card">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="small">Loading...</div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="card">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="small">Room not found</div>
        </div>
      </div>
    );
  }

  const { userPaidMap, userOwesMap, finalBalance, userExpenses } = calculateBalances();
  const members = roomData.members || [];
  const organizer = roomData.organizer || '';

  return (
    <div>
      {/* Header Section - Room Info */}
      <div className="card">
        <h3 className="small">Finalize & Preview</h3>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
          <div>
            <div className="small">Title</div>
            <div style={{ fontWeight: 700 }}>{roomData.title || "(untitled)"}</div>
            <div className="small" style={{ marginTop: 4 }}>Organizer: <b>{organizer || "(none)"}</b></div>
            <div className="small" style={{ marginTop: 4 }}>Members: <b>{members.join(", ")}</b></div>
            {roomData.notes && (
              <div className="small" style={{ marginTop: 4 }}>Notes: <i>{roomData.notes}</i></div>
            )}
          </div>
          <div>
            <button className="btn" onClick={downloadPDF}>Download PDF</button>
          </div>
        </div>
      </div>

      {/* All Expenses Table */}
      <div className="card" style={{ marginTop: 12 }}>
        <h4 className="small">All Expenses</h4>
        {expenses.length === 0 ? (
          <div className="small" style={{ color: '#999', padding: '20px', textAlign: 'center' }}>
            No expenses added yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', background: '#f5f5f5' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Total Amount</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Paid By</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Split Among</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={exp._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{i + 1}</td>
                    <td style={{ padding: '8px' }}>{exp.description}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{exp.total.toFixed(2)}</td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>
                      {exp.spentBy.map((p, idx) => (
                        <div key={idx}>{p.name}: ₹{p.amount.toFixed(2)}</div>
                      ))}
                    </td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>
                      {exp.spentFor.map((p, idx) => (
                        <div key={idx}>{p.name}: ₹{p.amount.toFixed(2)}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #ddd', fontWeight: 'bold' }}>
                  <td colSpan="2" style={{ padding: '8px' }}>Total</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
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
      <div className="card" style={{ marginTop: 12 }}>
        <h4 className="small">Individual Expense Breakdown</h4>
        {members.map(member => {
          const personExpenses = userExpenses[member] || [];
          const totalShare = userOwesMap[member] || 0;
          const totalPaid = userPaidMap[member] || 0;
          
          return (
            <div key={member} style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '14px' }}>
                {member} {member === organizer ? <span style={{ fontSize: '12px', color: '#666' }}>(Organizer)</span> : ''}
              </div>
              
              {personExpenses.length === 0 ? (
                <div className="small" style={{ color: '#999' }}>No expenses for this person</div>
              ) : (
                <table style={{ width: '100%', fontSize: '12px', marginTop: 8 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '4px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '4px', textAlign: 'left' }}>Expense</th>
                      <th style={{ padding: '4px', textAlign: 'right' }}>Share Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personExpenses.map((exp, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '4px' }}>{idx + 1}</td>
                        <td style={{ padding: '4px' }}>{exp.description}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>₹{exp.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '1px solid #ddd', fontWeight: 'bold' }}>
                      <td colSpan="2" style={{ padding: '4px' }}>Total Share</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{totalShare.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
              
              <div style={{ marginTop: 8, fontSize: '12px' }}>
                <div>Paid: <b>₹{totalPaid.toFixed(2)}</b></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Settlement Table */}
      <div className="card" style={{ marginTop: 12 }}>
        <h4 className="small">Final Settlement (Payments to Organizer)</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', background: '#f5f5f5' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Person</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total Share</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total Paid</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Balance</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const share = userOwesMap[m] || 0;
                const paid = userPaidMap[m] || 0;
                const balance = finalBalance[m] || 0;
                const isOrganizer = m === organizer;
                
                return (
                  <tr key={m} style={{ 
                    borderBottom: '1px solid #eee',
                    background: isOrganizer ? '#faf3ff' : 'transparent'
                  }}>
                    <td style={{ padding: '8px', fontWeight: isOrganizer ? 700 : 400 }}>
                      {m} {isOrganizer ? <span className="small">(Organizer)</span> : ''}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{share.toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{paid.toFixed(2)}</td>
                    <td style={{ 
                      padding: '8px', 
                      textAlign: 'right',
                      fontWeight: 600,
                      color: balance > 0 ? '#d32f2f' : balance < 0 ? '#388e3c' : '#666'
                    }}>
                      {balance > 0 ? `₹${balance.toFixed(2)}` : balance < 0 ? `-₹${Math.abs(balance).toFixed(2)}` : '₹0.00'}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {isOrganizer ? (
                        <b>Collects from others</b>
                      ) : balance > 0 ? (
                        <span style={{ color: '#d32f2f' }}>Pay ₹{balance.toFixed(2)} to {organizer}</span>
                      ) : balance < 0 ? (
                        <span style={{ color: '#388e3c' }}>Receive ₹{Math.abs(balance).toFixed(2)} from {organizer}</span>
                      ) : (
                        <span style={{ color: '#666' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small" style={{ marginTop: 8, color: '#666' }}>
          <em>Note: Positive balance means the person owes money to the organizer. Negative balance means the person paid more than their share.</em>
        </p>
      </div>
    </div>
  );
}
