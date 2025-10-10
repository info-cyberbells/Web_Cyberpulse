import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllDepartments,
  addNewDepartment,
  editDepartment,
  removeDepartment,
  clearError,
  clearSuccessMessage,
} from '../features/department/departmentSlice';

const DepartmentManagementModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const {
    departments,
    loading,
    error,
    successMessage
  } = useSelector((state) => state.departments);
  const [newDepartment, setNewDepartment] = useState({ department: '', position: '' });
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Fetch departments
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllDepartments());
    }
  }, [isOpen, dispatch]);


  useEffect(() => {
    if (successMessage) {
      toast.dismiss();
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      dispatch(fetchAllDepartments());

      // Reset form states
      setNewDepartment({ department: '', position: '' });
      setEditingDepartment(null);
      setIsDeleteModalOpen(false);
      setDepartmentToDelete(null);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  //add department
  const handleAddDepartment = () => {
    toast.dismiss();

    const isDepartmentEmpty = !newDepartment.department.trim();
    const isPositionEmpty = !newDepartment.position.trim();

    if (isDepartmentEmpty && isPositionEmpty) {
      toast.error('Department and Position names cannot be empty');
      return;
    }

    if (isDepartmentEmpty) {
      toast.error('Department name cannot be empty');
      return;
    }

    if (isPositionEmpty) {
      toast.error('Position name cannot be empty');
      return;
    }



    dispatch(addNewDepartment(newDepartment));
  };

  // Edit department
  const handleEditDepartment = () => {
    if (!editingDepartment?.department.trim() || !editingDepartment?.position.trim()) {
      toast.error('Department and Position names cannot be empty');
      return;
    }

    dispatch(editDepartment({
      departmentId: editingDepartment._id,
      departmentData: {
        department: editingDepartment.department,
        position: editingDepartment.position,
      },
    }));
  };

  // Delete department
  const handleDeleteDepartment = () => {
    if (!departmentToDelete) return;

    dispatch(removeDepartment(departmentToDelete._id));
  };

  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    overflowY: 'auto',
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        aria-labelledby="department-management-modal"
      >
        <Box sx={modalStyle}>
          <Typography id="department-management-modal" variant="h6" component="h2" gutterBottom>
            Department Management
          </Typography>

          {/* Add/Edit Department Section */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label={editingDepartment ? "Edit Department Name" : "New Department Name"}
              value={editingDepartment ? editingDepartment.department : newDepartment.department}
              onChange={(e) =>
                editingDepartment
                  ? setEditingDepartment({ ...editingDepartment, department: e.target.value })
                  : setNewDepartment({ ...newDepartment, department: e.target.value })
              }
              sx={{ mb: 2 }}
              disabled={loading} // CHANGED from isLoading
            />
            <TextField
              fullWidth
              variant="outlined"
              label={editingDepartment ? "Edit Position" : "New Position"}
              value={editingDepartment ? editingDepartment.position : newDepartment.position}
              onChange={(e) =>
                editingDepartment
                  ? setEditingDepartment({ ...editingDepartment, position: e.target.value })
                  : setNewDepartment({ ...newDepartment, position: e.target.value })
              }
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={editingDepartment ? handleEditDepartment : handleAddDepartment}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (editingDepartment ? "Update" : "Add")}
              </Button>
              {editingDepartment && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setEditingDepartment(null)}
                  disabled={loading}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>

          {/* Department List */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Department Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : departments.length > 0 ? (
                  departments.map((dept) => (
                    <TableRow key={dept._id}>
                      <TableCell>{dept.department}</TableCell>
                      <TableCell>{dept.position}</TableCell>
                      <TableCell align="right">
                        <Button
                          color="primary"
                          onClick={() => setEditingDepartment(dept)}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                        <Button
                          color="error"
                          onClick={() => {
                            setDepartmentToDelete(dept);
                            setIsDeleteModalOpen(true);
                          }}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No departments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the department "{departmentToDelete?.department}"
            with position "{departmentToDelete?.position}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteModalOpen(false)}
            color="primary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDepartment}
            color="error"
            autoFocus
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DepartmentManagementModal;