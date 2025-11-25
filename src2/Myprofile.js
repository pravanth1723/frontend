import React, { useContext, useState, useEffect } from 'react';
import { store } from './App';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import './myprofilestyles.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

// Add Contact Modal Component
const AddModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [token] = useContext(store);

  const addContact = () => {
    axios.post('https://dpcontactmanager.onrender.com/api/contacts/', { name, email, phone }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        console.log('Contact added successfully');
        onSave(res.data); // Assuming response has the added contact
      })
      .catch(err => alert('Something went wrong'));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add Contact"
      //   style={{
      //     overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      //     content: { width: 'fit-content', height: 'fit-content', padding: '50px', borderRadius: '10px' }
      //   }}
      style={{
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        content: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          padding: '30px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
        }
      }}

    >
      <h2>Add Contact</h2>
      <label>Name:</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>Email:</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Phone:</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button onClick={onClose} style={{ marginRight: '10px' }}>Cancel</button>
        <button onClick={addContact}>Add</button>
      </div>
    </Modal>
  );
};

// Edit Contact Modal Component
const EditModal = ({ isOpen, onClose, contact, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setEmail(contact.email);
      setPhone(contact.phone);
    }
  }, [contact]);

  const handleSave = () => {
    if (contact) onSave({ ...contact, name, email, phone });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Contact"
      style={{
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        content: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          padding: '30px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
        }
      }}

    >
      <h2>Edit Contact</h2>
      <label>Name:</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>Email:</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Phone:</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button onClick={onClose} style={{ marginRight: '10px' }}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </Modal>
  );
};

// ContactsList Component
const ContactsList = ({ data, onEdit, onDelete }) => (
  <div className="contactsClass">
    <ul className="contacts-list">
      {data.map(contact => (
        <li key={contact._id}>
          <h2><strong>Name:</strong> {contact.name}</h2>
          <p><strong>Email:</strong> {contact.email}</p>
          <p><strong>Phone:</strong> {contact.phone}</p>
          <p>
            <button onClick={() => onEdit(contact)} style={{ marginRight: '10px', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
            <button onClick={() => onDelete(contact._id)} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTrash} /> Delete
            </button>
          </p>
        </li>
      ))}
    </ul>
  </div>
);


// ContactUploader Component for Image Uploads


// MyProfile Component
const MyProfile = () => {
  const [token, setToken] = useContext(store);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      axios.get('https://dpcontactmanager.onrender.com/api/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          setUsername(res.data.username);
          setData(res.data.contacts);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [token]);
  // useEffect(() => {
  //   ContactsList();
  // }, [data]);
  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`https://dpcontactmanager.onrender.com/api/contacts/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => setData(data.filter(contact => contact._id !== id)));
  };

  const handleSave = (updatedContact) => {
    axios.put(`https://dpcontactmanager.onrender.com/api/contacts/${updatedContact._id}`, updatedContact, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => setData(data.map(c => c._id === updatedContact._id ? updatedContact : c)))
      .catch(() => alert('Error updating contact'));
    setIsEditModalOpen(false);
  };

  const handleAddContact = (newContact) => {
    setData([...data, newContact]);
    setIsAddModalOpen(false);
  };

  //const handleContactsUploaded = (contacts) => setData([...data, ...contacts]);
  const ContactUploader = ({ onContactsUploaded }) => {
    const [image, setImage] = useState(null);
    const [token] = useContext(store);
    const handleImageChange = (e) => setImage(e.target.files[0]);

    const handleUpload = async () => {
      if (!image) {
        alert('Please select an image first.');
        return;
      }
    
      const formData = new FormData();
      formData.append('image', image);
    
      try {
        const response = await axios.post('https://dpcontactmanager.onrender.com/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
    
        const contacts = response.data.contacts || [];
        const addedContacts = [];
    
        for (const contact of contacts) {
          const { name, email, phone } = contact;
          try {
            const res = await axios.post(
              'https://dpcontactmanager.onrender.com/api/contacts/',
              { name, email, phone },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            addedContacts.push(res.data); // Collect added contacts
          } catch (err) {
            console.error('Error adding contact:', err);
          }
        }
    
        setData((prevData) => [...prevData, ...addedContacts]); // Update state in one batch
    
      } catch (error) {
        console.error('Error uploading image', error);
        alert('Failed to upload image and extract contacts.');
      }
    };
    
    return (
      <div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        
        <button onClick={handleUpload}>Upload</button>
        <br/>
        <h6>
            Add an image to add contacts write each contact row wise with 
            Name space phoneno space email
        </h6>
      </div>
    );
  };
  if (!token) return <Navigate to="/login" />;

  return (
    <div>
      <center>
        <h1 style={{ color: 'red' }}>Hi!!, {username}</h1>
        <h2>My Contacts</h2>
        <button onClick={() => setIsAddModalOpen(true)}>Add Contact</button>
        <ContactUploader />
        {loading ? <p>Loading contacts...</p> : <ContactsList data={data} onEdit={handleEdit} onDelete={handleDelete} />}
        <button onClick={() => setToken(null)}>Logout</button>
        <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} contact={selectedContact} onSave={handleSave} />
        <AddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddContact} />
      </center>
    </div>
  );
};

export default MyProfile;
