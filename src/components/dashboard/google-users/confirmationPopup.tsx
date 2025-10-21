import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent'; 
import Stack from '@mui/material/Stack'; // Import Stack for button layout


interface ConfirmationPopupProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message?: string; // will ad the text in the main screen where we are calling this component
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ open, onClose, onConfirm, message }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2, 
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <img
                    src="/assets/ErrorOtlined-Icon.gif"
                    alt="Warning"
                    style={{ width: 170, height: 170 }}
                />
            </Box>
            <DialogContent sx={{ textAlign: 'center', padding: '20px' }}>
                <Box sx={{ color: 'black', fontSize: '16px', fontWeight: 'bold' }}>
                    {message || 'Are you sure you want to Accept?'}
                </Box>
                <Box sx={{ fontSize: '14px', color: '#666', mt: 1, }}>
                    This action will add this user to system, are you sure you want to proceed?
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: '25px' }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            color: '#535353FF',
                            backgroundColor: '#E2E7F0',
                            border: 'none',
                            '&:hover': { borderColor: 'none', backgroundColor: '#CCCDCEFF' },
                            flex: 1, // Distribute width evenly
                            borderRadius: 20,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#1565c0' },
                            flex: 1, // Distribute width evenly
                            borderRadius: 20,
                        }}
                    >
                        Yes, Accept
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationPopup;