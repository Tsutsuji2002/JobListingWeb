import api from '../../../services/api';
import { toast } from 'react-toastify';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const validateImage = (file) => {
  if (!file) {
    toast.error('No file selected');
    return false;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error('Invalid file type. Please upload JPG, PNG, GIF, or WebP.');
    return false;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    toast.error('File too large. Maximum size is 5MB.');
    return false;
  }

  return true;
};

export const uploadImageToServer = async (file) => {
  if (!validateImage(file)) return null;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/blog/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      data: {
        link: response.data, // Assuming the backend returns the image URL directly
        alt: file.name,
        width: 'auto',
        height: 'auto'
      }
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      toast.error(error.response.data || 'Failed to upload image');
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('Error setting up image upload');
    }
    
    return null;
  }
};

// Keep other existing functions like imageBlockRenderer, etc.
export const imageBlockRenderer = (block) => {
  if (block.getType() === 'atomic') {
    return {
      component: ImageComponent,
      editable: false,
    };
  }
  return null;
};

export const ImageComponent = (props) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const { src, alt } = entity.getData();
  return (
    <img 
      src={src} 
      alt={alt || 'Content image'} 
      style={{ 
        maxWidth: '100%', 
        height: 'auto', 
        display: 'block', 
        margin: '10px 0' 
      }} 
    />
  );
};