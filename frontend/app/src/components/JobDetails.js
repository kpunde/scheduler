import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Tooltip,
    Divider,
    IconButton,
    Stack,
} from '@mui/material';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobDetails } from '../services/api';

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const response = await getJobDetails(id);
            setJob(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch job details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
            <Card>
                <CardContent>
                    {/* Header Section */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconButton onClick={() => navigate(-1)} size="small" color="primary">
                                <ArrowLeft />
                            </IconButton>
                            <Typography variant="h5" fontWeight="bold">
                                Job Details
                            </Typography>
                        </Stack>
                        <IconButton onClick={fetchJobDetails} disabled={loading}>
                            <RefreshCw className={loading ? 'animate-spin' : ''} />
                        </IconButton>
                    </Stack>

                    {/* Job Details */}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                                Basic Information
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Job Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {job.jobName}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Job Group
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {job.jobGroup}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Schedule
                            </Typography>
                            <Tooltip title="Cron Expression" arrow>
                                <Chip
                                    icon={<Clock />}
                                    label={job.cronExpression}
                                    size="small"
                                    color="primary"
                                />
                            </Tooltip>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Status
                            </Typography>
                            <Chip
                                label={job.active ? 'Active' : 'Inactive'}
                                size="small"
                                color={job.active ? 'success' : 'default'}
                            />
                        </Grid>

                        {/* HTTP Configuration */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                                HTTP Request Configuration
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary">
                                URL
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {job.url}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Method
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {job.method}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Headers
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {job.headers || 'No headers specified'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary">
                                Request Body
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {job.requestBody || 'No request body specified'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}
