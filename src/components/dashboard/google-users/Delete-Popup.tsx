import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';  
import Stack from '@mui/material/Stack'; // Import Stack for button layout
import {Trash } from '@phosphor-icons/react';


interface DeletePopupProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message?: string; // will ad the text in the main screen where we are calling this component
}

const DeletePopup: React.FC<DeletePopupProps> = ({ open, onClose, onConfirm, message }) => {
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
                    This action will delete this User from your system, are you sure you want to proceed?
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
                        startIcon={<Trash />}
                        sx={{
                            backgroundColor: '#FF3B3B',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#F12929FF' },
                            flex: 1,
                            borderRadius: 20,
                        }}
                    >
                        Yes, Delete
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>   
    );
};

export default DeletePopup;