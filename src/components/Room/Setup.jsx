import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";
import { BACKEND_URL } from "../../config";

/**
 * Setup Component
 * - Fetches and displays room metadata (title, members, organizer, notes)
 * - Allows editing and saving room details
 */
export default function Setup() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState('group');
  const [members, setmembers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [organizer, setOrganizer] = useState("");
  const [notes, setNotes] = useState("");


  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editmembers, setEditmembers] = useState("");
  const [editPaymentMethods, setEditPaymentMethods] = useState("");
  const [editOrganizer, setEditOrganizer] = useState("");
  const [editNotes, setEditNotes] = useState("");


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  // memoize fetchRoomMeta so it can be safely referenced in useEffect
  const fetchRoomMeta = useCallback(() => {
    setIsLoading(true);
    axios.get(`${BACKEND_URL}/api/rooms/${roomId}`, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          const data = response.data.data;
          setRoomName(data.name || "");
          setTitle(data.title || "");
          const roomKind = data.kind || 'group';
          setKind(roomKind);

          // Always keep backend members state (backend expects a 'members' array)
          const backendMembers = data.members || [];
          setmembers(Array.isArray(backendMembers) ? backendMembers : []);

          // For UI: treat payment methods as a view-layer mapping for personal rooms,
          // but backend variable stays as `members` (we'll send members on save).
          let fetchedPaymentMethods = data.paymentMethods || data.payment_methods;
          if (roomKind === 'personal') {
            // if backend doesn't provide explicit paymentMethods, fall back to members
            fetchedPaymentMethods = fetchedPaymentMethods || backendMembers;
          }
          setPaymentMethods(Array.isArray(fetchedPaymentMethods) ? fetchedPaymentMethods : []);

          setNotes(data.notes || "");

          if (roomKind === 'personal') {
            // ensure organizer is the current account username (account holder)
            axios.get(`${BACKEND_URL}/api/users/me`, { withCredentials: true })
              .then(userResp => {
                const username = userResp.data?.data?.userId || data.organizer || "";
                setOrganizer(username);
              })
              .catch(err => {
                console.error("Error fetching current user:", err);
                setOrganizer(data.organizer || "");
              })
              .finally(() => setIsLoading(false));
          } else {
            setOrganizer(data.organizer || "");
            setIsLoading(false);
          }
        }
      })
      .catch(error => {
        console.error("Error fetching room metadata:", error);
        setSnackbar({ category: 'error', message: 'Failed to load room details' });
        setIsLoading(false);
      });
  }, [roomId]);

  useEffect(() => {
    fetchRoomMeta();
  }, [fetchRoomMeta]);

  function handleEdit() {
    setEditTitle(title);
    setEditmembers(members.join("\n"));
    setEditPaymentMethods(paymentMethods.join("\n"));
    setEditOrganizer(organizer);
    setEditNotes(notes);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  function handleSave() {
    const trimmedTitle = editTitle.trim();
    const trimmedNotes = editNotes.trim();

    if (!trimmedTitle) {
      setSnackbar({ category: 'error', message: 'Title is required' });
      return;
    }

    // Build payload differently depending on room kind
    let payload = { title: trimmedTitle, notes: trimmedNotes };

    if (kind === 'personal') {
      const paymentMethodsArray = editPaymentMethods.split("\n").map(p => p.trim()).filter(p => p);
      if (paymentMethodsArray.length < 1) {
        setSnackbar({ category: 'error', message: 'At least 1 payment method is required for personal rooms' });
        return;
      }
      // For personal rooms: show payment methods in UI but keep backend variable name `members`.
      payload.members = paymentMethodsArray;
      // Organizer should be account holder (set from /api/users/me earlier)
      payload.organizer = organizer;
    } else {
      const membersArray = editmembers.split("\n").map(p => p.trim()).filter(p => p);
      const trimmedOrganizer = editOrganizer.trim();

      if (membersArray.length < 2) {
        setSnackbar({ category: 'error', message: 'At least 2 members are required' });
        return;
      }
      if (!trimmedOrganizer || !membersArray.includes(trimmedOrganizer)) {
        setSnackbar({ category: 'error', message: 'Organizer must be one of the members' });
        return;
      }

      payload.members = membersArray;
      payload.organizer = trimmedOrganizer;
    }

    setIsSaving(true);
    axios.put(`${BACKEND_URL}/api/rooms/${roomId}`, payload, { withCredentials: true })
      .then(response => {
        setIsSaving(false);
        if (response.status === 200) {
          setTitle(trimmedTitle);
          setNotes(trimmedNotes);
          if (kind === 'personal') {
            // store both UI-facing paymentMethods and backend-facing members
            setPaymentMethods(payload.members);
            setmembers(payload.members);
            // organizer remains the account holder
            setOrganizer(payload.organizer);
          } else {
            setmembers(payload.members);
            setOrganizer(payload.organizer);
          }
          setIsEditing(false);
          setSnackbar({ category: 'success', message: 'Room details saved successfully!' });
        }
      })
      .catch(error => {
        setIsSaving(false);
        console.error("Error saving room details:", error);
        const errorMsg = error.response?.data?.message || 'Failed to save room details';
        setSnackbar({ category: 'error', message: errorMsg });
      });
  }

  function handleNext() {
    const isReady = kind === 'personal' ? (paymentMethods.length >= 1 && !!organizer) : (members.length >= 2 && !!organizer);
    if (!title || !isReady) {
      setSnackbar({ category: 'error', message: 'Please complete the room setup before proceeding' });
      return;
    }
    navigate(`/room/${roomId}/step2`);
  }

  if (isLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Spinner size="large" />
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading room details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          marginBottom: '8px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '2rem' }}>🏠</span>
          Room: {roomName}
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Room ID: {roomId}</p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            color: '#1f2937',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.8rem' }}>⚙️</span>
            Room Setup
          </h3>
          {!isEditing && (
            <button
              onClick={handleEdit}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
              }}
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {!isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                marginBottom: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Title
              </div>
              <div style={{ fontSize: '1.1rem', color: '#1f2937', fontWeight: '500' }}>
                {title || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>}
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                marginBottom: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {kind === 'personal' ? 'Payment Methods' : 'Members'}
              </div>
              <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                {kind === 'personal' ? (
                  paymentMethods.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {paymentMethods.map((method, idx) => (
                        <span key={idx} style={{
                          backgroundColor: '#eef2ff',
                          color: '#1e3a8a',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }}>
                          {method}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>
                  )
                ) : (
                  members.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {members.map((person, idx) => (
                        <span key={idx} style={{
                          backgroundColor: '#ede9fe',
                          color: '#6b21a8',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }}>
                          👤 {person}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>
                  )
                )}
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                marginBottom: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Organizer
              </div>
              <div style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                {organizer ? (
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    ⭐ {organizer}
                  </span>
                ) : (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>
                )}
              </div>
            </div>



            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                marginBottom: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Notes
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#1f2937',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                {notes || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter room title"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {kind === 'personal' ? (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}>
                  Payment methods (one per line) *
                </label>
                <textarea
                  value={editPaymentMethods}
                  readOnly={true}
                  placeholder="Enter payment methods (one per line)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                    backgroundColor: '#f9fafb',
                    cursor: 'not-allowed',
                    opacity: 0.7
                  }}
                />
                <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '8px' }}>
                  Payment methods cannot be edited for personal rooms.
                </div>
              </div>
            ) : (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}>
                  members (one per line) *
                </label>
                <textarea
                  value={editmembers}
                  onChange={(e) => setEditmembers(e.target.value)}
                  placeholder="Enter person names (one per line)"
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Organizer *
              </label>
              {kind === 'personal' ? (
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {organizer || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Organizer is the account holder for personal rooms and cannot be changed.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {editmembers.split("\n").map(p => p.trim()).filter(p => p).map((person, idx) => (
                    <label key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: editOrganizer === person ? '#ede9fe' : '#f9fafb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: `2px solid ${editOrganizer === person ? '#a78bfa' : '#e5e7eb'}`,
                      transition: 'all 0.3s'
                    }}
                      onMouseEnter={(e) => {
                        if (editOrganizer !== person) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (editOrganizer !== person) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}>
                      <input
                        type="radio"
                        name="organizer"
                        value={person}
                        checked={editOrganizer === person}
                        onChange={(e) => setEditOrganizer(e.target.value)}
                        style={{ marginRight: '10px', cursor: 'pointer' }}
                      />
                      <span style={{
                        fontWeight: editOrganizer === person ? '600' : '500',
                        color: editOrganizer === person ? '#6b21a8' : '#374151'
                      }}>
                        {person}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>



            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Notes
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add any notes or additional information here..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: isSaving ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: isSaving ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                {isSaving && <Spinner size="small" color="#ffffff" />}
                <span>💾 {isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        )}

        {!isEditing && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #f3f4f6' }}>
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '1.05rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              <span>Next: Add Expenses</span>
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
          </div>
        )}
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
