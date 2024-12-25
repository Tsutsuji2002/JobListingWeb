import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const CVPreviewModal = ({ isOpen, onClose, cvPreviewData }) => {
  if (!isOpen || !cvPreviewData) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg" // Increase the max width
      fullWidth
      PaperProps={{
        style: {
          width: '100vw', // Set the width to 80% of the viewport width
          height: '100vh', // Set the height to 90% of the viewport height
          backgroundColor: 'lightblue', // Set the background color to white
          borderRadius: '10px', // Add rounded corners
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
        },
      }}
    >
      <DialogTitle>Xem trước CV</DialogTitle>
      <DialogContent>
        <div className="flex-grow overflow-auto p-4" style={{ height: '80vh' }}>
          {cvPreviewData.contentType === 'application/pdf' ? (
            <iframe
              src={cvPreviewData.url}
              className="w-full h-full border rounded-lg"
              title="CV Preview"
              style={{ height: '100%' }}
            />
          ) : (
            <p>Xem trước không khả dụng cho loại tệp này</p>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CVPreviewModal;
