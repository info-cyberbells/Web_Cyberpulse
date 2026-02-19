import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Button,
    Typography,
    Box,
    Paper,
    Divider,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { deleteEmployeeAccountThunk } from "../../features/employeeDocuments/employeeDocumentsSlice";

const DeleteAccount = () => {
    const dispatch = useDispatch();
    const { deleteLoading } = useSelector(
        (state) => state.employeeDocuments
    );

    const handleDelete = async () => {
        const confirm = window.confirm(
            "Are you sure? This action cannot be undone."
        );
        if (!confirm) return;

        const result = await dispatch(deleteEmployeeAccountThunk());

        if (deleteEmployeeAccountThunk.fulfilled.match(result)) {
            alert("Account deleted successfully");
            localStorage.clear();
            window.location.href = "/login";
        } else {
            alert(result.payload || "Failed to delete account");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    maxWidth: 480,
                    width: "100%",
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                }}
            >
                <WarningAmberIcon
                    sx={{ fontSize: 50, color: "error.main", mb: 1 }}
                />

                <Typography variant="h5" fontWeight={700} color="error">
                    Delete Account
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Deleting your account will permanently deactivate your access.
                    This action <strong>cannot be undone</strong>.
                </Typography>

                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    fullWidth
                    onClick={handleDelete}
                    disabled={deleteLoading}
                >
                    {deleteLoading ? "Deleting Account..." : "Delete My Account"}
                </Button>
            </Paper>
        </Box>
    );
};

export default DeleteAccount;
