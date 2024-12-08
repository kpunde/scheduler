import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/jobs', // Replace with your backend URL
});

export const createJob = (jobData) => api.post('', jobData);
export const getAllActiveJobs = (page = 0, size = 10, status = 'ALL') =>
    api.get('', {
        params: {
            page,
            size,
            status,
        },
    });

export const getJobStatus = (jobId) => api.get(`/${jobId}`);
export const getJobExecutionHistory = (jobId, page = 0, size = 10) =>
    api.get(`/${jobId}/history`, {
        params: {
            page,
            size,
        },
    });
export const deleteJob = (jobId) => api.delete(`/${jobId}`);
export const getJobDetails = (jobId) => api.get(`/${jobId}`); // Added function

