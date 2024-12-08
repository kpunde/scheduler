import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid2,
    MenuItem,
    TextField,
    Typography,
    Button,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
} from '@mui/material';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';

export default function CreateJobForm() {
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: 'success', message: '' });

    const [job, setJob] = useState({
        jobName: '',
        jobGroup: '',
        cronExpression: '',
        parameters: '',
        url: '',
        method: 'GET',
        requestBody: '',
        headers: '',
        active: true,
    });

    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        switch (name) {
            case 'jobName':
                return value.trim() ? '' : 'Job name is required.';
            case 'jobGroup':
                return value.trim() ? '' : 'Job group is required.';
            case 'cronExpression':
                return value.trim() ? '' : 'Cron expression is required.';
            case 'url':
                return /^https?:\/\/.+/.test(value) ? '' : 'Please enter a valid URL.';
            case 'method':
                return ['GET', 'POST', 'PUT', 'DELETE'].includes(value) ? '' : 'Invalid method.';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJob((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(job).forEach((key) => {
            const error = validateField(key, job[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createJob(job);
            setToastMessage({ type: 'success', message: 'Job created successfully!' });
            setShowToast(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setToastMessage({ type: 'error', message: 'Failed to create job. Please try again.' });
            setShowToast(true);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
            <Card>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton onClick={() => navigate('/')} color="primary">
                                <ArrowLeft />
                            </IconButton>
                            <Typography variant="h5" fontWeight="bold">
                                Create New Job
                            </Typography>
                        </Box>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid2 container spacing={3}>
                            {/* Basic Information */}
                            <Grid2 item xs={12}>
                                <Typography variant="h6" fontWeight="medium" gutterBottom>
                                    Basic Information
                                </Typography>
                                <Grid2 container spacing={2}>
                                    <Grid2 item xs={12} md={6}>
                                        <TextField
                                            label="Job Name"
                                            name="jobName"
                                            value={job.jobName}
                                            onChange={handleChange}
                                            error={!!errors.jobName}
                                            helperText={errors.jobName}
                                            fullWidth
                                            required
                                        />
                                    </Grid2>
                                    <Grid2 item xs={12} md={6}>
                                        <TextField
                                            label="Job Group"
                                            name="jobGroup"
                                            value={job.jobGroup}
                                            onChange={handleChange}
                                            error={!!errors.jobGroup}
                                            helperText={errors.jobGroup}
                                            fullWidth
                                            required
                                        />
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            {/* Schedule Configuration */}
                            <Grid2 item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Typography variant="h6" fontWeight="medium">
                                        Schedule Configuration
                                    </Typography>
                                    <Tooltip title="Cron expressions define job schedules. For example, '0 0/15 * * * ?' means every 15 minutes." arrow>
                                        <IconButton size="small">
                                            <HelpCircle />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <TextField
                                    label="Cron Expression"
                                    name="cronExpression"
                                    value={job.cronExpression}
                                    onChange={handleChange}
                                    error={!!errors.cronExpression}
                                    helperText={errors.cronExpression || "e.g., '0 0/15 * * * ?' for every 15 minutes"}
                                    fullWidth
                                    required
                                />
                            </Grid2>

                            {/* HTTP Request Configuration */}
                            <Grid2 item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" fontWeight="medium" gutterBottom>
                                    HTTP Request Configuration
                                </Typography>
                                <Grid2 container spacing={2}>
                                    <Grid2 item xs={12} md={8}>
                                        <TextField
                                            label="URL"
                                            name="url"
                                            value={job.url}
                                            onChange={handleChange}
                                            error={!!errors.url}
                                            helperText={errors.url}
                                            fullWidth
                                            required
                                        />
                                    </Grid2>
                                    <Grid2 item xs={12} md={4}>
                                        <TextField
                                            select
                                            label="Method"
                                            name="method"
                                            value={job.method}
                                            onChange={handleChange}
                                            error={!!errors.method}
                                            helperText={errors.method}
                                            fullWidth
                                            required
                                        >
                                            {['GET', 'POST', 'PUT', 'DELETE'].map((method) => (
                                                <MenuItem key={method} value={method}>
                                                    {method}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid2>
                                    <Grid2 item xs={12}>
                                        <TextField
                                            label="Headers (JSON format)"
                                            name="headers"
                                            value={job.headers}
                                            onChange={handleChange}
                                            multiline
                                            rows={3}
                                            fullWidth
                                            helperText='e.g., {"Content-Type": "application/json"}'
                                        />
                                    </Grid2>
                                    <Grid2 item xs={12}>
                                        <TextField
                                            label="Request Body"
                                            name="requestBody"
                                            value={job.requestBody}
                                            onChange={handleChange}
                                            multiline
                                            rows={4}
                                            fullWidth
                                        />
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                            <Button variant="outlined" onClick={() => navigate('/')}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" color="primary">
                                Create Job
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            {/* Snackbar for feedback */}
            <Snackbar
                open={showToast}
                autoHideDuration={6000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowToast(false)}
                    severity={toastMessage.type}
                    variant="filled"
                >
                    {toastMessage.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
