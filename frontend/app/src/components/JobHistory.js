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
    Typography,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    TextField,
    MenuItem,
    InputAdornment,
    TablePagination,
    Grid,
} from '@mui/material';
import { ArrowLeft, Search, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getJobExecutionHistory } from '../services/api';

export default function JobHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ status: 'ALL', search: '' });
    const [currentPage, setCurrentPage] = useState(0); // Current page
    const [pageSize, setPageSize] = useState(10); // Page size
    const [totalRecords, setTotalRecords] = useState(0); // Total records
    const { jobId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, [jobId, currentPage, pageSize]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await getJobExecutionHistory(jobId, currentPage, pageSize); // Pass pagination params
            setHistory(response.data.content);
            setTotalRecords(response.data.totalElements);
            setError(null);
        } catch (err) {
            setError('Failed to fetch job history. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setCurrentPage(0); // Reset to first page when page size changes
    };

    const renderStatus = (status) => {
        switch (status) {
            case 'SUCCESS':
                return (
                    <Chip
                        icon={<CheckCircle />}
                        label="Success"
                        size="small"
                        sx={{ bgcolor: 'green.100', color: 'green.800' }}
                    />
                );
            case 'FAILED':
                return (
                    <Chip
                        icon={<XCircle />}
                        label="Failed"
                        size="small"
                        sx={{ bgcolor: 'red.100', color: 'red.800' }}
                    />
                );
            default:
                return status;
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
            <Card>
                <CardContent>
                    {/* Header */}
                    <Grid container justifyContent="space-between" alignItems="center" mb={4}>
                        <Grid item>
                            <Box display="flex" alignItems="center" gap={2}>
                                <IconButton onClick={() => navigate(-1)} size="small" color="primary">
                                    <ArrowLeft />
                                </IconButton>
                                <Typography variant="h5" fontWeight="bold">
                                    Job Execution History
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={fetchHistory} disabled={loading}>
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
                                label="Status Filter"
                                value={filter.status}
                                onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
                                size="small"
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="SUCCESS">Success</MenuItem>
                                <MenuItem value="FAILED">Failed</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={8}>
                            <TextField
                                fullWidth
                                label="Search by Trigger or Message"
                                placeholder="Search..."
                                value={filter.search}
                                onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
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

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Table */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Trigger Name</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Error Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : history.length > 0 ? (
                                history.map((execution) => {
                                    const startTime = new Date(execution.startTime);
                                    const endTime = new Date(execution.endTime);
                                    const duration = ((endTime - startTime) / 1000).toFixed(2);

                                    return (
                                        <TableRow key={execution.uuid}>
                                            <TableCell>{execution.triggerName}</TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Clock />
                                                    {format(startTime, 'MMM d, yyyy HH:mm:ss')}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{duration}s</TableCell>
                                            <TableCell>{renderStatus(execution.status)}</TableCell>
                                            <TableCell>
                                                <Typography noWrap>
                                                    {execution.errorMessage || 'No error message'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography>No execution history found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <TablePagination
                        component="div"
                        count={totalRecords} // Total records
                        page={currentPage}
                        onPageChange={handlePageChange}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={handlePageSizeChange}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </CardContent>
            </Card>
        </Box>
    );
}
