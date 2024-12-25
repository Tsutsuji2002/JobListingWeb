import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { previewCV } from '../../redux/slices/cvSlice';

const CVPreviewPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(previewCV(parseInt(id)))
        .then((action) => {
          if (action.payload) {
            setPreviewUrl(action.payload);
          } else {
            setError('Could not load CV preview');
          }
        })
        .catch((err) => {
          console.error('Preview error:', err);
          setError('An error occurred while loading the preview');
        });
    }
  }, [id, dispatch]);

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading preview...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <iframe 
          src={previewUrl} 
          width="100%" 
          height="600px" 
          title="CV Preview"
          className="border-none"
        />
      </div>
    </div>
  );
};

export default CVPreviewPage;