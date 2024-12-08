import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Tooltip,
    CircularProgress,
    TablePagination,
    Grid,
    MenuItem,
} from '@mui/material';
import { Plus, Search, RefreshCw, Trash2, Clock, AlertCircle, Info, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteJob, getAllActiveJobs } from '../services/api';

export default function JobList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // Added state for status filter
    const [deleteDialog, setDeleteDialog] = useState({ open: false, jobId: null });
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [currentPage, setCurrentPage] = useState(0); // Current page
    const [pageSize, setPageSize] = useState(10); // Page size
    const [totalPages, setTotalPages] = useState(0); // Total pages

    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, [currentPage, pageSize, statusFilter]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await getAllActiveJobs(currentPage, pageSize, statusFilter); // Send status filter in request
            setJobs(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            showToast('Failed to fetch jobs. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteJob(deleteDialog.jobId);
            setJobs(jobs.filter((job) => job.id !== deleteDialog.jobId));
            showToast('Job deleted successfully!', 'success');
        } catch (error) {
            showToast('Failed to delete job. Please try again.', 'error');
        } finally {
            setDeleteDialog({ open: false, jobId: null });
        }
    };

    const showToast = (message, severity) => {
        setToast({ open: true, message, severity });
    };

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setCurrentPage(0); // Reset to first page
    };

    const formatCronExpression = (cron) => (
        <Tooltip title="Schedule expression" arrow>
            <Chip
                icon={<Clock />}
                label={cron}
                size="small"
                color="primary"
            />
        </Tooltip>
    );

    const renderStatus = (isActive) => (
        <Chip
            label={isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
                bgcolor: isActive ? 'green.100' : 'red.100',
                color: isActive ? 'green.800' : 'red.800',
            }}
        />
    );

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
            <Card>
                <CardContent>
                    {/* Header */}
                    <Grid container justifyContent="space-between" alignItems="center" mb={4}>
                        <Typography variant="h5" fontWeight="bold">
                            Scheduled Jobs
                        </Typography>
                        <Grid item>
                            <Button
                                variant="contained"
                                startIcon={<Plus />}
                                onClick={() => navigate('/create')}
                                sx={{ mr: 2 }}
                            >
                                Create Job
                            </Button>
                            <IconButton onClick={fetchJobs} disabled={loading}>
                                <RefreshCw className={loading ? 'animate-spin' : ''} />
                            </IconButton>
                        </Grid>
                    </Grid>

                    {/* Filters */}
                    <Grid container spacing={2} mb={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="Filter by Status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={8}>
                            <TextField
                                fullWidth
                                placeholder="Search by job name, group, or schedule..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>

                    {/* Jobs Table */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Job Name</TableCell>
                                <TableCell>Job Group</TableCell>
                                <TableCell>Schedule</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Configuration</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : jobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Box>
                                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <Typography>No jobs found</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell>{job.jobName}</TableCell>
                                        <TableCell>{job.jobGroup}</TableCell>
                                        <TableCell>{formatCronExpression(job.cronExpression)}</TableCell>
                                        <TableCell>{renderStatus(job.active)}</TableCell>
                                        <TableCell>
                                            <Tooltip title={job.url} arrow>
                                                <Typography noWrap>{job.method}</Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Details">
                                                <IconButton onClick={() => navigate(`/jobs/${job.id}/details`)}>
                                                    <Info />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View History">
                                                <IconButton onClick={() => navigate(`/jobs/${job.id}/history`)}>
                                                    <History />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Job">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => setDeleteDialog({ open: true, jobId: job.id })}
                                                >
                                                    <Trash2 />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <TablePagination
                        component="div"
                        count={totalPages * pageSize} // Approximation for total items
                        page={currentPage}
                        onPageChange={handlePageChange}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={handlePageSizeChange}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, jobId: null })}>
                <DialogTitle>Delete Job</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this job? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, jobId: null })}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast Notifications */}
            <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
