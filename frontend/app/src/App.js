import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateJobForm from './components/CreateJobForm';
import JobList from './components/JobList';
import './App.css';
import JobHistory from "./components/JobHistory";
import JobDetails from "./components/JobDetails";

const App = () => (
    <Router>
      <Routes>
        <Route path="/" element={<JobList />} />
        <Route path="/create" element={<CreateJobForm />} />
        <Route path="/jobs/:jobId/history" element={<JobHistory />} />
        <Route path="/jobs/:id/details" element={<JobDetails />} />
      </Routes>
    </Router>
);

export default App;
