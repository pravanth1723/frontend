import React, { useState } from 'react';
import axios from 'axios';

const ContactUploader = () => {
  const [image, setImage] = useState(null);
  const [contacts, setContacts] = useState([]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5500/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setContacts(response.data.contacts); // Assuming the backend sends extracted contacts
      console.log(contacts);
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
     
    </div>
  );
};

export default ContactUploader;
