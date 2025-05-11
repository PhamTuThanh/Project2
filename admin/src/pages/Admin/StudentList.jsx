import React, { useEffect, useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';

const cohorts = [
  'Cohort 65',
  'Cohort 64',
  'Cohort 63',
  'Cohort 62',
  'Cohort 61',
  'Cohort 60',
  'Cohort 59',
];

const majors = [
  'Information Technology',
  'Transport Operation',
  'Architecture',
  'Accounting',
  'Logistic',
  'Automotive',
];

const StudentList = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCohort && selectedMajor) {
      fetchStudents();
    } else {
      setStudents([]);
    }
    // eslint-disable-next-line
  }, [selectedCohort, selectedMajor]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/list-students',
        { cohort: selectedCohort, major: selectedMajor },
        { headers: { aToken } }
      );
      if (data.success) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    }
    setLoading(false);
  };

  return (
    <div className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Student List</p>
      <div className="flex gap-4 mb-6">
        <select
          className="border rounded px-3 py-2 min-w-[220px]"
          value={selectedCohort}
          onChange={e => setSelectedCohort(e.target.value)}
        >
          <option value="">-- Select Cohort --</option>
          {cohorts.map(cohort => (
            <option key={cohort} value={cohort}>{cohort}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2 min-w-[220px]"
          value={selectedMajor}
          onChange={e => setSelectedMajor(e.target.value)}
        >
          <option value="">-- Select Major --</option>
          {majors.map(major => (
            <option key={major} value={major}>{major}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white border rounded p-4 max-h-[70vh] overflow-y-auto">
          {students.length === 0 ? (
            <p>No students found</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b p-2">#</th>
                  <th className="border-b p-2">Name</th>
                  <th className="border-b p-2">Email</th>
                  <th className="border-b p-2">Student ID</th>
                  <th className="border-b p-2">Cohort</th>
                  <th className="border-b p-2">Major</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student._id}>
                    <td className="border-b p-2">{idx + 1}</td>
                    <td className="border-b p-2">{student.name}</td>
                    <td className="border-b p-2">{student.email}</td>
                    <td className="border-b p-2">{student.studentId}</td>
                    <td className="border-b p-2">{student.cohort}</td>
                    <td className="border-b p-2">{student.major}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentList; 